const router = require('express').Router();

const { EventImage, Event, Membership } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');


// Delete an Image for an Event
router.delete('/:imageId', requireAuth, async (req, res, next) => {
    const currentUserId = req.user.id;
    const { imageId } = req.params;

    const eventImageToDelete = await EventImage.findByPk(imageId);

    if (!eventImageToDelete) {
        const err = new Error("Event Image couldn't be found");
        err.title = "Couldn't find an Image with the specified id";
        err.status = 404;
        next(err);
        return;
    }

    const event = await Event.findByPk(eventImageToDelete.eventId);

    const groupId = event.groupId;


    const membershipInfo = await Membership.findOne({
        where: {
            groupId,
            userId: currentUserId
        }
    })

    if (!membershipInfo || (membershipInfo.status !== 'Owner' && membershipInfo.status !== 'Co-host')) {
        const err = new Error('Forbidden');
        err.title = 'Forbidden';
        err.status = 403;
        next(err);
        return;
    } else {
        await eventImageToDelete.destroy();

        res.json({message: "Successfully deleted"})
    }


})



module.exports = router;
