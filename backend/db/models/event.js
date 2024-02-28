'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Event.hasMany(models.EventImage, {
        foreignKey: 'eventId',
        onDelete: 'CASCADE',
        hooks: true
      })

      Event.belongsToMany(models.User, {
        through: models.Attendance,
        foreignKey: 'eventId',
        otherKey: 'userId'
      })

      Event.belongsTo(models.Venue, {
        foreignKey: 'venueId'
      })

      Event.belongsTo(models.Group, {
        foreignKey: 'groupId'
      })
    }
  }
  Event.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    venueId: DataTypes.INTEGER,
    groupId: DataTypes.INTEGER,
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: DataTypes.TEXT,
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isValidType(value) {
          if (value !== 'Online' && value !== 'In person') {
            throw new Error("Value must be 'Online' or 'In person'")
          }
        }
      }
    },
    capacity: DataTypes.INTEGER,
    price: DataTypes.DECIMAL(6, 2),
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Event',
  });
  return Event;
};
