import catchAsync from '../../utils/catchAsync';
import { bikeService } from './bike.service';
import { StatusCodes } from 'http-status-codes';


// create a controller for create bike
// this controller is used to create a new bike. The user must provide the bike's details in the request body. If the bike is created successfully, a success message is returned.
// The request must include a valid access token in the Authorization header. If the bike is created successfully, a success message is returned.
// The user must provide the bike's details in the request body. If the bike is created successfully, a success message is returned.
// The request must include a valid access token in the Authorization header. If the bike is created successfully, a success message is returned.

const createBike = catchAsync(async (req, res) => {
  await bikeService.createBike(req.body);
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Bike create successfully',
    statusCode: StatusCodes.OK,
  });
});

// get all bike
// create a controller for get all bikes
// this controller is used to get all bikes. The user must provide the bike's details in the request body. If the bike is created successfully, a success message is returned.
// The request must include a valid access token in the Authorization header. If the bike is created successfully, a success message is returned.

const getBikes = catchAsync(async (req, res) => {
  const queryData = req?.query;
  //  get bike use bike service function
  const result = await bikeService.getBikes(queryData);
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'All bikes get successfully',
    statusCode: StatusCodes.OK,
    data: result.result,
    meta:result.meta
  });
});

// create a controller for get specific bikes

const getSpecificBike = catchAsync(async (req, res) => {
  const productId = req.params.productId;
  const result = await bikeService.getSpecificBike(productId);
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Bike retrieved successfully',
    statusCode: StatusCodes.OK,
    data: result,
  });
});

// create a controller for update bikes
const updateBike = catchAsync(async (req, res) => {
  const productId = req?.params?.productId;
  const body = req.body;
  // console.log(productId,body);
  // console.log(body, 'body');
  const result = await bikeService.updateBike(productId, body);
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Bike update successfully',
    statusCode: StatusCodes.OK,
    data: result,
  });
});

// create a controller for delete bike
const deleteBike = catchAsync(async (req, res) => {
  // get id from parameters
  const productId = req.params.productId;
  await bikeService.deleteBike(productId);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Bike Delete successfully',
    statusCode: StatusCodes.OK,
    data: null,
  });
});

export const bikeController = {
  createBike,
  getBikes,
  getSpecificBike,
  updateBike,
  deleteBike,
};