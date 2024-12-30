import mongoose from "mongoose";

const domainMappingSchema = new mongoose.Schema({
    domain: { type: String, required: true, unique: true },
    ip: { type: String, required: true },
});

const DomainMapping = mongoose.model('DomainMapping', domainMappingSchema);


export default DomainMapping