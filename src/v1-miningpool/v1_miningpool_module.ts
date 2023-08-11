import{Module} from '@nestjs/common'
import { V1PoolController } from "./v1_miningpool_controller";
@Module({
    imports:[],
    controllers:[
        V1PoolController,
    ],
    providers:[],

    exports:[],

})  

export class v1_miningpool_module{}