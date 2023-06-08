import { DataTypes, Sequelize } from 'sequelize';
import { dbConfig } from './config';

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: 'mysql',
});

export const Contact = sequelize.define('Contact', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  phoneNumber: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
  },
  linkedId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Contacts',
      key: 'id',
    },
  },
  linkPrecedence: {
    type: DataTypes.ENUM('primary', 'secondary'),
    defaultValue: 'primary',
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

// Create the table if it doesn't exist
sequelize.sync();
