"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contact = void 0;
const sequelize_1 = require("sequelize");
const config_1 = require("./config");
const sequelize = new sequelize_1.Sequelize(config_1.dbConfig.database, config_1.dbConfig.username, config_1.dbConfig.password, {
    host: config_1.dbConfig.host,
    port: config_1.dbConfig.port,
    dialect: 'mysql',
});
exports.Contact = sequelize.define('Contact', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    phoneNumber: {
        type: sequelize_1.DataTypes.STRING,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
    },
    linkedId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Contacts',
            key: 'id',
        },
    },
    linkPrecedence: {
        type: sequelize_1.DataTypes.ENUM('primary', 'secondary'),
        defaultValue: 'primary',
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    deletedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
});
// Create the table if it doesn't exist
sequelize.sync();
//# sourceMappingURL=models.js.map