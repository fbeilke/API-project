const router = require('express').Router();
const { check } = require('express-validator');

const { handleValidationErrors } = require('../../utils/validation');
const { Event, Group, Venue, Attendance, EventImage, Membership } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');


const validateEvent = [
    check('name')
        .exists({checkFalsy: true})
        .isLength({min: 5})
        .withMessage("Name must be at least 5 characters"),
    check('type')
        .exists({checkFalsy: true})
        .isIn(['Online', 'In person'])
        .withMessage("Type must be Online or In person"),
    check('capacity')
        .isNumeric({min: 1})
        .withMessage("Capacity must be an integer"),
    check('price')
        .isFloat({min: 0})
        .withMessage("Price is invalid"),
    check('description')
        .exists({checkFalsy: true})
        .withMessage("Description is required"),
    check('startDate')
        .custom(value => {
           currentDate = new Date();
           valueFormatted = new Date(value);
           return currentDate < valueFormatted
        })
        .withMessage("Start date must be in the future"),
    check('endDate')
        .custom((value, {req}) => {
            endDateFormatted = Date.parse(value);
            startDateFormatted = Date.parse(req.body.startDate);
            return endDateFormatted > startDateFormatted;
        })
        .withMessage("End date is less than start date"),
    handleValidationErrors
]


// Authorization
const isAttendee = async (req, res, next) => {
    const currentUserId = req.user.id;
    const { eventId } = req.params;

    const validEvent = await Event.findByPk(eventId)

    if (!validEvent) {
        const err = new Error("Event couldn't be found");
        err.title = "Couldn't find an Event with the specified id";
        err.status = 404;
        next(err);
    }

    const validAttendee = await Attendance.findOne({
        where: {
            userId: currentUserId,
            eventId,
            status: 'attending'
        }
    })

    if (!validAttendee) {
        const err = new Error("Forbidden");
        err.title = "Forbidden";
        err.status = 403;
        next(err);
    }

    next()
}

const isOwnerOrCohostMember = async (req, res, next) => {
    const currentUserId = req.user.id;
    const { eventId } = req.params;

    const event = await Event.findByPk(eventId);

    if(!event) {
        const err = new Error("Event couldn't be found");
        err.title = "Couldn't find a Event with the specified id"
        err.status = 404;
        next(err);
    }

    const groupId = event.groupId;

    const membershipInfo = await Membership.findOne({
        where: {
            groupId: groupId,
            userId: currentUserId
        }
    })

    if (!membershipInfo || (membershipInfo.status !== 'Owner' && membershipInfo.status !== 'Co-host')) {
        const err = new Error('Forbidden');
        err.title = 'Forbidden';
        err.status = 403;
        next(err);
    }

    next()
  }

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


// Add an Image to an Event based on the Event's id
router.post('/:eventId/images', requireAuth, isAttendee, async (req, res, next) => {
    const { eventId } = req.params;
    const { url, preview } = req.body;

    const newImage = await EventImage.create({
        eventId,
        url,
        preview
    })

    const result = await EventImage.findByPk(newImage.id, {
        attributes: ['id', 'url', 'preview']
    })

    res.json(result);

})

// Edit an Event specified by its id
router.put('/:eventId', requireAuth, isOwnerOrCohostMember, validateEvent, async (req, res, next) => {
    const { eventId } = req.params;
    const { venueId, name, type, capacity, price, description, startDate, endDate } = req.body;

    const validVenue = await Venue.findOne({
        where: {
            id: venueId
        }
    });

    if (!validVenue && venueId !== null) {
        const err = new Error("Venue couldn't be found");
        err.title = "Couldn't find a Venue with the specified id";
        err.status = 404;
        next(err);
    }

    const currentEvent = await Event.findByPk(eventId);

    await currentEvent.update({
        venueId,
        name,
        type,
        capacity,
        price,
        description,
        startDate,
        endDate
    })

    const result = await Event.findByPk(eventId, {
        attributes: {
            exclude: ['createdAt', 'updatedAt']
        }
    })

    res.json(result);

})


// Delete an Event specified by its id
router.delete('/:eventId', requireAuth, isOwnerOrCohostMember, async (req, res, next) => {
    const { eventId } = req.params;

    const currentEvent = await Event.findByPk(eventId);

    currentEvent.destroy();

    res.json({message: "Successfully deleted"})
})




module.exports = router;
