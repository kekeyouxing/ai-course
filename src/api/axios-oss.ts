import axios from "axios";

const instance_oss = axios.create({
    baseURL: "https://videos-1256301913.cos.ap-guangzhou.myqcloud.com"
})


export default instance_oss