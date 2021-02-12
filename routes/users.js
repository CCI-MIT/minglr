const express = require("express");

const { User } = require("../schemas/User");

const { log } = require("../libs/log");
const { getCurrentUser } = require("../middleware/getCurrentUser");
const { getCurrentGroup } = require("../middleware/getCurrentGroup");

const router = express.Router();

async function getUsers(users) {

    let userArray = await Promise.all(
        users.map(user_id => {
            let user = User.findOne(
                { _id: user_id },
            );
            return user.getData();
        })
    );

    return userArray;
}

router.get("/users/:user_id", (req, res) => {
    const current_id = req.cookies.w_id;

    try {
        if (!current_id || current_id === undefined || current_id.length === 0 || current_id === "undefined") 
            return res.json({
                success: false,
                message: "user not authorized",
            });

        User.findOne({id: req.params.user_id}).then(async clickedUser => { // followed user

            if (!clickedUser) {
                return res.status(200).json({
                    success: false,
                    message: "wrong user id sent",
                })
            }

            await getUsers(clickedUser.followers).then(newFollowers => {
                if (clickedUser.matched) {
                    User.findById(clickedUser.matched).then(matchedUser => {
                        res.status(200).json({
                            success: true,
                            user: clickedUser.getData(),
                            followers: newFollowers,
                            matched: matchedUser.getData(),
                        })
                    })
    
                }
                else {
                    res.status(200).json({
                        success: true,
                        user: clickedUser.getData(),
                        followers: newFollowers,
                    })
                }
    
                console.log("* CLICKED: ", clickedUser.id, "by", current_id, new Date().toISOString());
                log("CLICKED", current_id, clickedUser._id.toString());
            })

        });
    } catch (err) {console.error(err)}
                
});
router.get("/approach", getCurrentUser, getCurrentGroup, async (req, res) => {
    const user = res.locals.user;
    const group = res.locals.group;

    const current_id = user._id.toString();

    let newRest = [];
    let newFollowings = [];

    for (const member of group.activeMembers) {
        await User.findById(member._id).then(u => {
            if (member._id.toString() == current_id || !u.available) {}
            else if (user.isFollowing(u._id)) {
                newFollowings.push(u.getData());
            }
            else if (!user.isFollowedBy(u._id)) {
                newRest.push(u.getData());
            }
        });
    }

    return res.status(200).json({
        success: true,
        followings: newFollowings,
        rest: newRest,
    })

});

router.get("/greet", getCurrentUser, getCurrentGroup, async (req, res) => {
    const user = res.locals.user;
    // const group = res.locals.group;

    await getUsers(user.followers).then(newFollowers => {
        return res.status(200).json({
            success: true,
            followers: newFollowers,
        });
    });
});

router.post("/search", getCurrentUser, (req, res) => {
    const user = res.locals.user;
    const current_id = user._id.toString();

    console.log("* SEARCHED: ", req.body.value, "by", current_id, new Date().toISOString());
    log("SEARCH", current_id, req.body.value);
})

module.exports = router;