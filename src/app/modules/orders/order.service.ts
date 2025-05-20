/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Types, PipelineStage } from 'mongoose';
import QueryBuilder from '../../builder/queryBuilder';
import AppError from '../../errors/AppError';
import Bike from '../bikes/bike.model';
import Order from './order.model';
import { orderUtils } from './order.utils';
import { StatusCodes } from 'http-status-codes';
import { TTokenResponse } from '../auth/auth.interface';
import User from '../auth/auth.model';


// create this service for create a order
const createOrder = async (
  user: TTokenResponse,
  payload: { products: { _id: string; quantity: number }[] },
  client_ip: string,
) => {
  const id = user?.userId;
  const userData = await User.findById(id);
  if (!payload?.products?.length)
    throw new AppError(403, 'Order is not specified');

  const products = payload?.products;

  let totalPrice = 0;
  const productDetails = await Promise.all(
    products.map(async (item) => {
      const product = await Bike.findById(item._id);
      if (product) {
        const subtotal = product ? (product?.price || 0) * item.quantity : 0;
        totalPrice += subtotal;
        return item;
      }
    }),
  );

  const transformedProducts: any[] = [];

  productDetails.forEach((product) => {
    transformedProducts.push({
      product: product?._id,
      quantity: product?.quantity,
    });
  });

  let order = await Order.create({
    user: id,
    products: transformedProducts,
    totalPrice,
  });

  // payment integration
  const shurjopayPayload = {
    amount: totalPrice,
    order_id: order._id,
    currency: 'BDT',
    customer_name: userData?.name,
    customer_address: userData?.address,
    customer_email: userData?.email,
    customer_phone: userData?.phone,
    customer_city: 'N/A',
    client_ip,
  };

  const payment = await orderUtils.makePaymentAsync(shurjopayPayload);



  // console.log(payment, 'payment');
  if (payment?.transactionStatus) {
    order = await order.updateOne({
      transaction: {
        id: payment.sp_order_id,
        transactionStatus: payment.transactionStatus,
      },
    });
  }

  return payment.checkout_url;


};
// get orders
const getOrders = async (
  user: TTokenResponse,
  query: Record<string, unknown>,
) => {
  const searchableFields = [
    'model',
    'description',
    'category',
    'brand',
    'name',
  ];

  if (user?.role === 'admin') {
    const orderQuery = new QueryBuilder(
      Order.find().populate('user products.product'),
      query,
    )
      .search(searchableFields)
      .filter()
      .sort()
      .paginate()
      .fields();

    const result = await orderQuery.modelQuery;
    const meta = await orderQuery.countTotal();
    return {
      meta,
      result,
    };
  }

  const orderQuery = new QueryBuilder(
    Order.find({ user: user.userId }).populate('user products.product'),
    query,
  )
    .search(searchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await orderQuery.modelQuery;
  const meta = await orderQuery.countTotal();
  return {
    meta,
    result,
  };
};


// verify payme service
const verifyPayment = async (order_id: string) => {
  const verifiedPayment = await orderUtils.verifyPaymentAsync(order_id);
  if (verifiedPayment[0]?.customer_order_id) {
    const findOrder = await Order.findById(
      verifiedPayment[0]?.customer_order_id,
    );
    for (const item of findOrder?.products as {
      product: Types.ObjectId;
      quantity: number;
    }[]) {
      const bike = await Bike.findById(item.product);
      if (!bike || bike.quantity < item.quantity) {
        throw new AppError(StatusCodes.CONFLICT, `Not enough stock for ${bike?.name}`);
      }

      bike.quantity -= item.quantity;
      if (bike.quantity === 0) {
        bike.inStock = false;
      }

      await bike.save();
    }


  }
  if (verifiedPayment.length) {
    await Order.findOneAndUpdate(
      {
        "transaction.id": order_id,
      },
      {
        "transaction.bank_status": verifiedPayment[0].bank_status,
        "transaction.sp_code": verifiedPayment[0].sp_code,
        "transaction.sp_message": verifiedPayment[0].sp_message,
        "transaction.transactionStatus": verifiedPayment[0].transaction_status,
        "transaction.method": verifiedPayment[0].method,
        "transaction.date_time": verifiedPayment[0].date_time,
        status:
          verifiedPayment[0].bank_status == "Success"
            ? "Paid"
            : verifiedPayment[0].bank_status == "Failed"
              ? "Pending"
              : verifiedPayment[0].bank_status == "Cancel"
                ? "Cancelled"
                : "",
      },
      { new: true }
    );
    //  console.log(res,order_id,"res")
  }

  return verifiedPayment;
};

// services/order.service.ts

import { OrderStatus } from './order.interface'; // update path as needed
export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus
) => {
  const validStatuses: OrderStatus[] = ['Cancelled', 'Delivered', 'Shipped'];
  
  if (!validStatuses.includes(status)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid status value');
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Order not found');
  }

  if (order.status === 'Cancelled' || order.status === 'Delivered') {
    throw new AppError(StatusCodes.CONFLICT, `Order already ${order.status}`);
  }

  order.status = status;
  await order.save();

  return order;
};


// create this service for get total revenue
const getTotalRevenue = async () => {
  const result = await Order.aggregate([
    {
      $group: {
        // Grouping by null will aggregate all documents
        _id: null,
        // Sum the totalPrice field across all orders
        totalRevenue: { $sum: '$totalPrice' },
      },
    },
    {
      $project: {
        // Include only totalRevenue in the result
        _id: 0,
        totalRevenue: 1,
      },
    },
  ]);
  if (result.length === 0) {
    return { totalRevenue: 0 };
  }

  return result[0];
};
// create this service for get monthly-revenue
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const getMonthlyRevenue = async () => {
 
    const revenue = await Order.aggregate([
      {
        $match: { status: "Delivered" },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$totalPrice" }, // ✅ corrected field
        },
      },
      {
        $sort: { "_id": 1 },
      },
    ]);

    const result = revenue.map(item => ({
      month: monthNames[item._id - 1],
      revenue: item.revenue,
    }));
return result
};




export const getUserMonthlyBookings = async (userId: string) => {
  const pipeline: PipelineStage[] = [
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        month: "$_id",
        count: 1,
        _id: 0,
      },
    },
    {
      $sort: {
        month: 1,
      },
    },
  ];

  const result = await Order.aggregate(pipeline);
  return result;
};

// get order counts grouped by status (for pie chart)

const getOrderStatusCounts = async () => {
  const result = await Order.aggregate([
    {
      $group: {
        _id: '$status',          // group by status field
        count: { $sum: 1 },      // count how many orders per status
      },
    },
    {
      $project: {
        _id: 0,
        status: '$_id',          // rename _id to status
        count: 1,
      },
    },
  ]);

  // Optional: if no data, return empty array
  return result || [];
};

// 
import { startOfISOWeek, endOfISOWeek, format } from 'date-fns';
export async function getWeeklySalesData() {
  const now = new Date();
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(now.getDate() - 42); // last 6 weeks

  const sales = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: fourWeeksAgo, $lte: now },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          week: { $isoWeek: "$createdAt" },
        },
        totalSales: { $sum: "$totalPrice" },
      },
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.week": 1,
      },
    },
  ]);

  // Add formatted week range
  const formattedSales = sales.map((item: any) => {
    const year = item._id.year;
    const week = item._id.week;

    const startDate = startOfISOWeek(new Date(year, 0, 1 + (week - 1) * 7));
    const endDate = endOfISOWeek(startDate);

    const formatted = {
      week: `Week ${week} (${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')})`,
      totalSales: item.totalSales,
    };

    return formatted;
  });

  return formattedSales;
}

export const getDailyOrderCountsInWeek = async () => {
  const endDate = new Date(); // today
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 6); // last 7 days

  const result = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: {
          day: { $dayOfWeek: "$createdAt" }, // 1 (Sunday) to 7 (Saturday)
        },
        count: { $sum: 1 },
      },
    },
  ]);

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const countsMap = result.reduce((acc, cur) => {
    const dayIndex = (cur._id.day + 5) % 7; // shift so Monday = 0
    acc[dayLabels[dayIndex]] = cur.count;
    return acc;
  }, {} as Record<string, number>);

  const final = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({
    day,
    orders: countsMap[day] || 0,
  }));

  return final;
};

// services/order.service.ts
export const getMonthlySalesByYear = async (year: number) => {
  const startDate = new Date(`${year}-01-01`);
  const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

  const result = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
        status: "Delivered" // optional filter
      },
    },
    {
      $group: {
        _id: { month: { $month: "$createdAt" } },
        totalSales: { $sum: "$totalPrice" }, // ✅ correct field name
      },
    },
  ]);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const countsMap = result.reduce((acc, cur) => {
    acc[cur._id.month] = cur.totalSales;
    return acc;
  }, {} as Record<number, number>);

  const final = months.map((month, idx) => ({
    month,
    sales: countsMap[idx + 1] || 0,
  }));

  return final;
};




export const orderService = {
  createOrder,
  getTotalRevenue,
  updateOrderStatus,
  getOrders,
  verifyPayment,
  getOrderStatusCounts,
  getWeeklySalesData,
  getDailyOrderCountsInWeek,
getMonthlySalesByYear,
getMonthlyRevenue,
getUserMonthlyBookings
};