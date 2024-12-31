class ApiResponse {
    constructor(statuscode,data, message= "Sucess"){
       this.statuscode= statuscode,
       this.data= data,
       this.message= message,
       this.sucess = statuscode < 400
    }
}
export {ApiResponse}