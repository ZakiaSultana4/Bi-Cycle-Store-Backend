
import { orderService } from './order.service';
import catchAsync from '../../utils/catchAsync';
import { StatusCodes } from 'http-status-codes';
import { TTokenResponse } from '../auth/auth.interface';
import sendResponse from '../../utils/sendResponse';


// create a controller for create o order
const createOrder = catchAsync(async (req, res) => {
  const user=req?.user as TTokenResponse;
  const payload = req.body;
  const result = await orderService.createOrder(user, payload, req.ip!);
 
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Order create successfully',
    statusCode: StatusCodes.OK,
    data:result,
  });
});
// get order 
const getOrders = catchAsync(async (req, res) => {
  const user=req?.user as TTokenResponse;
  const queryData = req?.query;
  const result = await orderService.getOrders(user,queryData);
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Order get successfully',
    statusCode: StatusCodes.OK,
    data: result.result,
    meta:result.meta
  });
});
// verify payment controller 
const verifyPayment = catchAsync(async (req, res) => {
  const order_id= req?.body.order_id as string;
  const result = await orderService.verifyPayment(order_id as string);
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'verify order successfully',
    statusCode: StatusCodes.OK,
    data: result,
   
  });
});

export const updateOrderStatus= catchAsync(
  async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    const updatedOrder = await orderService.updateOrderStatus(orderId, status);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Order status updated to ${status}`,
      data: updatedOrder,
    });
  }
)
// create a controller for get total revenue
const getTotalRevenue = catchAsync(async (req, res) => {
  const result = await orderService.getTotalRevenue();
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'verify order successfully',
    statusCode: StatusCodes.OK,
    data: result,
   
  });
});
// create a controller for get total revenue
const getMonthlyRevenue = catchAsync(async (req, res) => {
  const result = await orderService.getMonthlyRevenue();
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'get Monthly Revenue successfully',
    statusCode: StatusCodes.OK,
    data: result,
   
  });
});
// create a controller for get total revenue
const getUserMonthlyBookings = catchAsync(async (req, res) => {
  const userId = req.params.userId;

  const result = await orderService.getUserMonthlyBookings(userId);
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'get User Monthly Bookings successfully',
    statusCode: StatusCodes.OK,
    data: result,
   
  });
});

const getOrderStatusCounts = catchAsync(async (req, res) => {

  
  const data = await orderService.getOrderStatusCounts();
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Order status counts fetched successfully',
    statusCode: StatusCodes.OK,
    data,
  });
});


export const getWeeklySales =catchAsync(async (req, res)  => {

    const data = await orderService.getWeeklySalesData();

 
      res.status(StatusCodes.OK).json({
    success: true,
    message: 'Order status counts fetched successfully',
    statusCode: StatusCodes.OK,
    data,
  });
  
})

export const getOrderCountsInWeeks = catchAsync(async (req, res) => {


  const data = await orderService.getDailyOrderCountsInWeek();

  res.status(200).json({
    success: true,
    message: "Daily order count fetched successfully",
    data,
  });
});

// controllers/order.controller.ts

// controllers/order.controller.ts

export const getMonthlySales = catchAsync(async (req, res) => {
  const year = parseInt(req.query.year as string) || new Date().getFullYear();
  const data = await orderService.getMonthlySalesByYear(year);

  res.status(200).json({
    success: true,
    message: `Monthly sales for year ${year} fetched successfully`,
    data,
  });
});


export const orderController = {
  createOrder,
  getTotalRevenue,
  getOrders,
  verifyPayment,
  getOrderStatusCounts,
  getWeeklySales,
  getOrderCountsInWeeks,
  getMonthlySales,
  updateOrderStatus,
  getMonthlyRevenue,
  getUserMonthlyBookings
  
};