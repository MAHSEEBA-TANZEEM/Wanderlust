const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing,validateId} = require("../middleware.js");
const { populate } = require("../models/review.js");
const listingController = require("../controllers/listings.js");
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });

router.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(listingController.createListing));


// New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

router.route("/:id")
.get(validateId, wrapAsync(listingController.showListing))
.put(isLoggedIn, isOwner, upload.single('listing[image]'), validateId, validateListing, wrapAsync(listingController.updateListing))
.delete(isLoggedIn, isOwner, validateId, wrapAsync(listingController.destroyListing));

// Edit Route
router.get("/:id/edit",isOwner, validateId,isLoggedIn, wrapAsync(listingController.renderEditForm));

module.exports = router;