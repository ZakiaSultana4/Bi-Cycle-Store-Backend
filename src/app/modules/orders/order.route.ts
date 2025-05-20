import express from 'express';
import { getOrderCountsInWeeks,getWeeklySales, orderController } from './order.controller';

import { orderValidation } from './order.validation';
import { USER_ROLE } from '../auth/auth.interface';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
const orderRoutes = express.Router();

// 1.create order route------✓✓
// this route is used to create a new order. The user must provide the order's details in the request body.
// The request must include a valid access token in the Authorization header. 
// The user must provide the order's details in the request body. If the order is created successfully, a success message is returned.
orderRoutes.post(
  '/',
  auth(USER_ROLE.customer, USER_ROLE.admin),
  validateRequest(orderValidation.orderValidationSchema),
  orderController.createOrder,
);

// 2. get all orders route------✓✓
// this route is used to get all orders.
orderRoutes.get(
  '/',
  auth(USER_ROLE.customer, USER_ROLE.admin),
  orderController.getOrders,
);

// 3. get specific order route------✓✓
// this route is used to get a specific order by Admin.
// The request must include a valid access token in the Authorization header. 
orderRoutes.patch("/verify", auth(USER_ROLE.admin), orderController.verifyPayment);

// 4. get total revenue route------✓✓
// this route is used to get total revenue by Admin.
// The request must include a valid access token in the Authorization header.
orderRoutes.get('/revenue',auth(USER_ROLE.admin), orderController.getTotalRevenue);
orderRoutes.get('/monthly-revenue', orderController.getMonthlyRevenue);
orderRoutes.get("/user-monthly-bookings/:userId", orderController.getUserMonthlyBookings);
orderRoutes.patch('/:orderId/status', orderController.updateOrderStatus);

orderRoutes.get('/status-counts', orderController.getOrderStatusCounts);

orderRoutes.get("/weekly-sales", getWeeklySales);
orderRoutes.get("/daily-order-counts", getOrderCountsInWeeks);
// routes/order.route.ts

orderRoutes.get('/monthly-sales', orderController.getMonthlySales);


export default orderRoutes;