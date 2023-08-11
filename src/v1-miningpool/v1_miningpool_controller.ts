import{Controller, Get} from '@nestjs/common';
import axios, {AxiosResponse} from 'axios';


@Controller('pool')

export class V1PoolController{
    @Get()
    async fetchData(): Promise<AxiosResponse>{
        try{
            const response = await axios.get('http://pool.merov.io/pool/1_merov_backend_api.php');
            
            return response.data;
        } catch (error){
            throw new Error('Error fetching data');
        }
    }

}