const express = require("express");
const mongoose = require('mongoose');

const { Group } = require("../schemas/Group");

const { log } = require("../libs/log");
const { groupSocket } = require("../libs/groupSocket");
const { deactivate } = require("../libs/deactivate");
const { addNewUser } = require("../libs/socketMethods");
const { getCurrentUser } = require("../middleware/getCurrentUser");

const router = express.Router();

async function getGroups(groups) {

    let groupArray = await Promise.all(
        groups.map(group_id => {
            return Group.findOne(
                { _id: group_id },
            );
        })
    );

    return groupArray;
}

const socketMap = {};
router.get("/groups", getCurrentUser, async (req, res) => {
    try {
        const currentUser = res.locals.user;

        // if (currentUser.available) {
        //     deactivate(currentUser.available, currentUser._id);
        //     currentUser.available = undefined;
        // }

        await getGroups(currentUser.joinedGroups).then(async joinedGroups => {
            await getGroups(currentUser.createdGroups).then(createdGroups => {

                return res.status(200).json({
                    success: true,
                    joinedGroups: joinedGroups,
                    createdGroups: createdGroups,
                });
            });
        })

    } catch (err) {console.error(err)}
});

router.get("/group/:group_id", getCurrentUser, (req, res) => {
    const user = res.locals.user;
    const group_id = req.params.group_id;

    // if group does not exist return error
    try {
        if (mongoose.Types.ObjectId.isValid(group_id)) {
            Group.findById(group_id).then(group => {
                if (!group) {
                    return res.json({
                        success: false,
                        message: "The group does not exist",
                    });
                }

                // if id is not in joined or created groups, add the group_id to joined groups
                // and add the user_id to members
                if (!user.isIn(group_id)) {
                    user.joinedGroups.push(group._id);
                    group.members.push(user._id);
                }

                // set group_id as available
                user.available = group._id;
                if (group.activeMembers.filter(m => m._id.equals(user._id)).length === 0)
                    group.activeMembers.push(user._id);

                group.save((err, doc) => {
                    if (err) {console.error(err)}

                    // send response
                    res.json({
                        success: true,
                        groupName: group.name
                    })

                    // connect to namespace of group id
                    const io = req.app.get("io");
                    let groupName = `/group${group_id}`;
                    if(!socketMap[groupName]) {
                        groupSocket(io, group_id)
                        socketMap[groupName] = true;
                    }

                    const groupIO = io.of(`/group${group_id}`);
                    addNewUser(doc.activeMembers, user, groupIO);

                    // save user
                    user.save((err, doc) => {
                        if (err) {console.error(err)}
                    })
                });
                
            });
        }
        else {
            return res.json({
                success: false,
                message: "You have typed in a wrong url.",
            }); 
        }
    } catch (err) {
        console.error(err);
    }
})

router.post("/create_group", getCurrentUser, (req, res) => {
    const user = res.locals.user;

    const group = new Group({
        name: req.body.name,
        creator: user._id,
    });

    group.save((err, doc) => {
        if (err) {console.error(err)}
        user.createdGroups.unshift(group._id);
        user.save((err, doc) => {
            if (err) {console.error(err)}
            return res.json({
                success: true,
            });
        })
    })
})



router.post("/mark_group_deleted", getCurrentUser, (req, res) => {
    const user = res.locals.user;
    const group_id =  req.body._id;

    Group.findById(group_id).then(group => {
        if (!group) {
            return res.json({
                success: false,
                message: "The group does not exist",
            });
        }
        group.isDeleted = true;

        group.save((err, doc) => {
            if (err) {
                console.error(err)
            }
            return res.json({
                success: true,
            });
        })
    })
})
router.post("/update_group", getCurrentUser, (req, res) => {
    const user = res.locals.user;
    const name =  req.body.name;
    const group_id =  req.body._id;

    Group.findById(group_id).then(group => {
        if (!group) {
            return res.json({
                success: false,
                message: "The group does not exist",
            });
        }
        group.name = name;

        group.save((err, doc) => {
            if (err) {
                console.error(err)
            }
                return res.json({
                    success: true,
                });
        })
    })
})

module.exports = router;
