import { v4 as uuidv4 } from 'uuid';
import { Server, StableBTreeMap, ic } from 'azle';
import express, { Request, Response } from 'express';

interface Event {
    EventId: string;
    EventName: string;
    Description: string;
    Organizer: string;
    Price: number;
    status: string;
    createdAt: Date;
    updatedAt?: Date;
}

interface Venue {
    VenueId: string;
    VenueName: string;
    Events: string[];
    createdAt: Date;
    updatedAt?: Date;
}

const VenueStorage = StableBTreeMap<string, Venue>(0);
const EventStorage = StableBTreeMap<string, Event>(1);

export default Server(() => {
    const app = express();
    app.use(express.json());

    // Create a venue
    app.post('/Venue', (req: Request, res: Response) => {
        const { VenueName } = req.body;
        try {
            const NewVenue: Venue = {
                VenueId: uuidv4(),
                VenueName,
                Events: [],
                createdAt: getCurrentDate(),
            };
            VenueStorage.insert(NewVenue.VenueId, NewVenue);
            return res.status(201).json({ status: 201, NewVenue });
        } catch (error: any) {
            return res.status(500).json({ status: 500, error: error.message });
        }
    });

    // Get all venues
    app.get('/Venue', (req: Request, res: Response) => {
        try {
            const AllVenue = VenueStorage.values();
            return res.status(200).json({ status: 200, AllVenue });
        } catch (error: any) {
            return res.status(500).json({ status: 500, error: error.message });
        }
    });

    // Update venue
    app.put('/Venue/:id', (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            const { VenueName } = req.body;
            const VenueExist = VenueStorage.get(id);
            if ('None' in VenueExist) {
                return res.status(404).json({ status: 404, error: 'Venue does not exist' });
            } else {
                const updatedVenue: Venue = {
                    ...VenueExist.Some,
                    VenueName,
                    updatedAt: getCurrentDate(),
                };

                VenueStorage.insert(VenueExist.Some.VenueId, updatedVenue);
                return res.status(200).json({ status: 200, message: 'Updated successfully' });
            }
        } catch (error: any) {
            return res.status(500).json({ status: 500, error: error.message });
        }
    });

    // Get one venue
    app.get('/Venue/:id', (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            const VenueExist = VenueStorage.get(id);

            if ('None' in VenueExist) {
                return res.status(404).json({ status: 404, error: 'Venue does not exist' });
            } else {
                const Venue = VenueExist.Some;
                return res.status(200).json({ status: 200, Venue });
            }
        } catch (error: any) {
            return res.status(500).json({ status: 500, error: error.message });
        }
    });

    // Delete venue
    app.delete('/Venue/:id', (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            const VenueExist = VenueStorage.get(id);
            if ('None' in VenueExist) {
                return res.status(404).json({ status: 404, error: 'Venue does not exist' });
            } else if (VenueExist.Some.Events.length > 0) {
                return res.status(400).json({ status: 404, error: 'Please remove all events from the venue before deletion' });
            } else {
                const deletedVenue = VenueStorage.remove(id);
                if ('None' in deletedVenue) {
                    return res.status(400).json({ status: 400, error: `We couldn't delete venue with id=${id}` });
                } else {
                    return res.status(200).json({ status: 200, message: 'Venue deleted successfully' });
                }
            }
        } catch (error: any) {
            return res.status(500).json({ status: 500, error: error.message });
        }
    });

    // Create and add event to venue
    app.post('/Venue/:id/Event', (req: Request, res: Response) => {
        try {
            const venueId = req.params.id;
            const { EventName, Description, Organizer, Price } = req.body;
            const VenueExist = VenueStorage.get(venueId);
            if ('None' in VenueExist) {
                return res.status(404).json({ status: 404, error: 'Venue does not exist' });
            }

            if (VenueExist.Some.Events.length === 5) {
                return res.status(400).json({ status: 404, error: 'Venue is full, please find another venue or create one' });
            }
            const NewEvent: Event = {
                EventId: uuidv4(),
                EventName,
                Description,
                Organizer,
                Price,
                status: 'Scheduled',
                createdAt: getCurrentDate(),
            };

            EventStorage.insert(NewEvent.EventId, NewEvent);
            VenueExist.Some.Events.push(NewEvent.EventId);
            const updatedVenue = {
                ...VenueExist.Some,
            };
            VenueStorage.insert(VenueExist.Some.VenueId, updatedVenue);
            return res.status(201).json({ status: 201, message: 'Event created and scheduled successfully' });
        } catch (error: any) {
            return res.status(500).json({ status: 500, error: error.message });
        }
    });

    // Remove event from venue
    app.put('/Venue/removeEvent/:VenueId/Event/:EventId', (req: Request, res: Response) => {
        try {
            const venueId = req.params.VenueId;
            const eventId = req.params.EventId;
            const VenueExist = VenueStorage.get(venueId);
            const EventExist = EventStorage.get(eventId);

            if ('None' in EventExist) {
                return res.status(400).json({ status: 400, error: 'Event does not exist' });
            }

            if ('None' in VenueExist) {
                return res.status(400).json({ status: 400, error: 'Venue does not exist' });
            }

            if (!VenueExist.Some.Events.includes(eventId)) {
                return res.status(400).json({ status: 400, error: `Event with id=${eventId} is not scheduled in Venue id=${venueId}` });
            }
            const NewEvents = VenueExist.Some.Events.filter((item) => item != eventId);

            const updatedVenue: Venue = {
                ...VenueExist.Some,
                Events: NewEvents,
                updatedAt: getCurrentDate(),
            };

            VenueStorage.insert(venueId, updatedVenue);
            const updatedEvent = {
                ...EventExist.Some,
                status: 'Unscheduled',
                updatedAt: getCurrentDate(),
            };

            EventStorage.insert(eventId, updatedEvent);

            return res.status(200).json({ status: 200, message: 'Event removed from venue successfully' });
        } catch (error: any) {
            return res.status(500).json({ status: 500, error: error.message });
        }
    });

    // Add existing event to venue
    app.put('/Venue/addEvent/:VenueId/Event/:EventId', (req: Request, res: Response) => {
        try {
            const venueId = req.params.VenueId;
            const eventId = req.params.EventId;
            const VenueExist = VenueStorage.get(venueId);
            const EventExist = EventStorage.get(eventId);

            if ('None' in EventExist) {
                return res.status(400).json({ status: 400, error: 'Event does not exist' });
            }
            if ('None' in VenueExist) {
                return res.status(400).json({ status: 400, error: 'Venue does not exist' });
            }

            if (VenueExist.Some.Events.includes(eventId)) {
                return res.status(400).json({ status: 400, error: `Event with id=${eventId} is already scheduled in Venue id=${venueId}` });
            }
            if (EventExist.Some.status === 'Scheduled') {
                return res.status(400).json({ status: 400, error: 'Event is already scheduled in this or another venue' });
            }
            const updatedEvent: Event = {
                ...EventExist.Some,
                status: 'Scheduled',
                updatedAt: getCurrentDate(),
            };

            EventStorage.insert(updatedEvent.EventId, updatedEvent);
            VenueExist.Some.Events.push(updatedEvent.EventId);
            const updatedVenue = {
                ...VenueExist.Some,
            };
            VenueStorage.insert(VenueExist.Some.VenueId, updatedVenue);

            return res.status(200).json({ status: 200, message: 'Event added to venue successfully' });
        } catch (error: any) {
            return res.status(500).json({ status: 500, error: error.message });
        }
    });

    // Get all events
    app.get('/Event', (req: Request, res: Response) => {
        try {
            const AllEvent = EventStorage.values();
            return res.status(200).json({ status: 200, AllEvent });
        } catch (error: any) {
            return res.status(500).json({ status: 500, error: error.message });
        }
    });

    // Get one event
    app.get('/Event/:id', (req: Request, res: Response) => {
        try {
            const eventId = req.params.id;
            const EventExist = EventStorage.get(eventId);

            if ('None' in EventExist) {
                return res.status(400).json({ status: 400, error: 'Event does not exist' });
            }

            return res.status(200).json({ status: 200, Event: EventExist.Some });
        } catch (error: any) {
            return res.status(500).json({ status: 500, error: error.message });
        }
    });

    // Delete event
    app.delete('/Event/:id', (req: Request, res: Response) => {
        try {
            const eventId = req.params.id;
            const EventExist = EventStorage.get(eventId);

            if ('None' in EventExist) {
                return res.status(400).json({ status: 400, error: 'Event does not exist' });
            }

            if (EventExist.Some.status === 'Scheduled') {
                return res.status(400).json({ status: 400, error: 'Please remove the event from the venue before deleting' });
            }

            EventStorage.remove(eventId);
            return res.status(200).json({ status: 200, message: 'Event deleted successfully' });
        } catch (error: any) {
            return res.status(500).json({ status: 500, error: error.message });
        }
    });

    // Edit existing event
    app.put('/Event/:id', (req: Request, res: Response) => {
        try {
            const eventId = req.params.id;
            const EventExist = EventStorage.get(eventId);

            if ('None' in EventExist) {
                return res.status(400).json({ status: 400, error: 'Event does not exist' });
            }
            const updatedEvent: Event = {
                ...EventExist.Some,
                ...req.body,
                updatedAt: getCurrentDate(),
            };

            EventStorage.insert(eventId, updatedEvent);
            return res.status(200).json({ status: 200, message: 'Updated successfully' });
        } catch (error: any) {
            return res.status(500).json({ status: 500, error: error.message });
        }
    });

    // Search the event in the venue
    app.post('/Event/search/:id', (req: Request, res: Response) => {
        try {
            const eventId = req.params.id;
            const EventExist = EventStorage.get(eventId);

            if ('None' in EventExist) {
                return res.status(401).json({ status: 401, error: 'This event does not exist' });
            }

            if (EventExist.Some.status === 'Unscheduled') {
                return res.status(401).json({ status: 401, error: 'This event is not scheduled in any venue' });
            }

            const allVenue = VenueStorage.values();
            for (let i = 0; i < allVenue.length; i++) {
                if (allVenue[i].Events.includes(eventId)) {
                    return res.status(200).json({ status: 200, message: `The event with id=${eventId} is scheduled in venue with id=${allVenue[i].VenueId}` });
                }

                return res.status(404).json({ status: 404, error: 'We could not find this event in any venue' });
            }
        } catch (error: any) {
            return res.status(500).json({ status: 500, error: error.message });
        }
    });

    const PORT = 4000;
    return app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});

const getCurrentDate = () => {
    const timestamp = new Number(ic.time());
    return new Date(timestamp.valueOf() / 1000_000);
};
