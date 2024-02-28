const router = require('express').Router();
const { check } = require('express-validator');

const { handleValidationErrors } = require('../../utils/validation');
const { Event, Group, Venue, Attendance, EventImage } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');


// Get all Events
router.get('/', async (req, res, next) => {

    const allEvents = await Event.findAll({
        attributes: {
            exclude: ['description', 'capacity', 'price', 'createdAt', 'updatedAt']
        },
        include: [
            {
                model: Group,
                attributes: ['id', 'name', 'city', 'state']
            },
            {
                model: Venue,
                attributes: ['id', 'city', 'state']
            }
        ]
    })

    const allEventsWith = await Promise.all(allEvents.map(async (event) => {

        const jsonEvent = event.toJSON();

        jsonEvent.numAttending = await Attendance.count({
            where: {
                eventId: event.id
            }
        })

        const imageObj = await EventImage.findOne({
            where: {
                eventId: event.id,
                preview: true
            }
        })

        if (!imageObj) {
            jsonEvent.previewImage = null;
        } else {
            const { url } = imageObj;
            jsonEvent.previewImage = url;
        }


        return jsonEvent
    }))


    res.json({Events: allEventsWith})

})


// Get details of an Event specified by its id
router.get('/:eventId', async (req, res, next) => {
    const { eventId } = req.params;

    const currentEvent = await Event.findByPk(eventId, {
        attributes: {
            exclude: ['createdAt', 'updatedAt']
        },
        include: [
            {
                model: Group,
                attributes: ['id', 'name', 'private', 'city', 'state']
            },
            {
                model: Venue,
                attributes: ['id', 'address', 'city', 'state', 'lat', 'lng']
            },
            {
                model: EventImage,
                attributes: ['id', 'url', 'preview']
            }
        ]
    })

    if (!currentEvent) {
        const err = new Error("Event couldn't be found");
        err.title = "Couldn't find an Event with the specified id";
        err.status = 404;
        err.errors = {message: "Event couldn't be found"};
        next(err);
    }

    const result = currentEvent.toJSON();
    result.numAttending = await Attendance.count({
        where: {
            eventId,
        }
    })

    res.json(result);
})








module.exports = router;
