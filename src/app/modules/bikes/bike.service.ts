// import QueryBuilder from '../../builder/queryBuilder';
import QueryBuilder from '../../builder/queryBuilder';
import { IBike } from './bike.interface';
import Bike from './bike.model';

// create this service for create a bike
const createBike = async (payload: IBike): Promise<IBike> => {
  const result = await Bike.create(payload);
  return result;
};

// Service to get all bikes with search, filter, sort, pagination, and field selection
const getBikes = async (query: Record<string, unknown>) => {
  const searchableFields = ["model", "description", "category", "brand", "name"];

  // Initialize QueryBuilder with the base Bike query and query params
  const bikeQuery = new QueryBuilder(Bike.find(), query)
    .search(searchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  // Execute the query to get results
  const result = await bikeQuery.modelQuery.exec();

  // Get total count and pagination meta info
  const meta = await bikeQuery.countTotal();

  return {
    meta,
    result,
  };
};

// create this service for get a Specific  bike
const getSpecificBike = async (id: string) => {
  const result = await Bike.findById(id);
  return result;
};

// create this service for update a bike
const updateBike = async (id: string, data: Partial<IBike>) => {
  // console.log(data,"update data")
  const result = await Bike.findByIdAndUpdate(id, data, { new: true });
  return result;
};

// create this service for delete a bike use a id
const deleteBike = async (id: string) => {
  const result = await Bike.findByIdAndDelete(id);
  return result;
};

export const bikeService = {
  createBike,
  getBikes,
  getSpecificBike,
  updateBike,
  deleteBike,
};
