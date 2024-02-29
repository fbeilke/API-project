const router = require('express').Router();

const { GroupImage, Membership } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');


// Delete an Image for a Group
router.delete('/:imageId', requireAuth, async (req, res, next) => {
    const currentUserId = req.user.id;
    const { imageId } = req.params;

    const groupImageToDelete = await GroupImage.findByPk(imageId);

    if (!groupImageToDelete) {
        const err = new Error("Group Image couldn't be found");
        err.title = "Couldn't find an Image with the specified id";
        err.status = 404;
        next(err);
        return;
    }

    const groupId = groupImageToDelete.groupId;


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
        await groupImageToDelete.destroy();

        res.json({message: "Successfully deleted"})
    }


})



module.exports = router;
