const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;

const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({path: "reviews", populate: {path: "author"},})
    .populate("owner");
    if (!listing) {
        // throw new ExpressError(404, "Listing not found!");
        req.flash("error","Listing you requested does not exist");
        res.redirect("/listings");
    }
    // console.log(listing);
    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res,next) => {
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
      })
    .send()

    let url = req.file.path;
    let filename = req.file.filename;
   
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    
    newListing.geometry = (response.body.features[0].geometry);

    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success","new listing created");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        // throw new ExpressError(404, "Listing not found!");
        req.flash("error","Listing you requested does not exist");
        res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    const { title, description, price, location } = req.body.listing;
    const updatedListing = await Listing.findByIdAndUpdate(id, { title, description, price, location }, { new: true });
    if (!updatedListing) {
        throw new ExpressError(404, "Listing not found!");
    }
    if(typeof req.file!== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        updatedListing.image =  {url, filename};
        await updatedListing.save();
    }
    req.flash("success","Listing Updated");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    const { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing deleted");
    if (!deletedListing) {
        throw new ExpressError(404, "Listing not found!");
    }
    res.redirect("/listings");
};