import express from 'express';
import { bikeController } from './bike.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../auth/auth.interface';
import validateRequest from '../../middleware/validateRequest';
import { bikeValidation } from './bike.validation';


const bikeRoutes = express.Router();

// 1.create bike route------✓✓
// this route is used to create a new bike. The user must provide the bike's details in the request body.
// The request must include a valid access token in the Authorization header. If the bike is created successfully, a success message is returned.
// The user must provide the bike's details in the request body. If the bike is created successfully, a success message is returned.
//  If the bike is created successfully, a success message is returned.
bikeRoutes.post('/',auth(USER_ROLE.admin),validateRequest(bikeValidation.bikeValidationSchema), bikeController.createBike);

//2. get all bikes route------✓✓
// this route is used to get all bikes. 
bikeRoutes.get('/', bikeController.getBikes);

//3. get specific bike route------✓✓
// this route is used to get a specific bike. 
bikeRoutes.get('/:productId', bikeController.getSpecificBike);

// 4.update bike route------✓✓
// this route is used to update a specific bike. The user must provide the bike's ID in the request parameters and the updated bike details in the request body. If the bike is updated successfully, a success message is returned.
// The request must include a valid access token in the Authorization header. If the bike is updated successfully, a success message is returned.
bikeRoutes.put('/:productId',auth(USER_ROLE.admin),validateRequest(bikeValidation.updateBikeValidationSchema), bikeController.updateBike);

// 5.delete bike route------✓✓
// this route is used to delete a specific bike. The user must provide the bike's ID in the request parameters.
// The request must include a valid access token in the Authorization header. 
// If the bike is deleted successfully, a success message is returned.
bikeRoutes.delete('/:productId',auth(USER_ROLE.admin), bikeController.deleteBike);


export default bikeRoutes;
