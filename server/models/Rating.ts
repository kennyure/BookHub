import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

// Interface for Rating attributes
interface RatingAttributes {
  id: number
  bookId: string
  userId: number
  rating: number
  createdAt?: Date
  updatedAt?: Date
}

// Interface for Rating creation (without id)
interface RatingCreationAttributes extends Optional<RatingAttributes, 'id'> {}

class Rating
  extends Model<RatingAttributes, RatingCreationAttributes>
  implements RatingAttributes
{
  public id!: number;
  public bookId!: string;
  public userId!: number;
  public rating!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Rating.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    bookId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
  },
  {
    sequelize,
    modelName: 'Rating',
  },
);

// Define associations
Rating.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Rating, { foreignKey: 'userId' });

export default Rating;
