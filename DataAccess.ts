import Mongoose = require("mongoose");

class DataAccess {
    static mongooseInstance: any;
    static mongooseConnection: Mongoose.Connection;
    static DB_CONNECTION_STRING: string = 'mongodb://dbAdmin:test@localhost:27017/recoverlyDemo?authSource=admin';

    constructor() {
        DataAccess.connect();
    }

    static test () {
        return "in DataAccess";
    }

    static connect ():Mongoose.Connection {
        if (this.mongooseInstance)
            return this.mongooseInstance;
            this.mongooseConnection = Mongoose.connection;
            this.mongooseConnection.on("open", () => {
                console.log("connected to mongodb.");
            });

            this.mongooseInstance = Mongoose.connect(this.DB_CONNECTION_STRING);
            return this.mongooseInstance;
        }
    }
DataAccess.connect();
export { DataAccess };