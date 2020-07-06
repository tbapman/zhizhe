import '../utils/DioUtils.dart';
import '../models/to_do.dart';
import '../models/add_result.dart';

class ToDoApi {
  //GET
  // static Future<List<ToDoData>> getToDoData() async {
  //   var result = await HttpUtils.request(
  //     '/home/get',
  //     method: HttpUtils.GET,
  //   );

  //   ToDoModel obj=ToDoModel.fromJson(result);
  //   return obj.data;
  // }
  // POST 请求
  static Future<ToDoModel> getToDoData() async {
    var result = await HttpUtils.request('/plan/getToDoList',
        method: HttpUtils.POST,
        data: {
          "id": "15840128101406283378",
          "eDate": "9999-12-30T16:00:00.000Z",
          "sDate": "-000001-12-31T15:54:17.000Z"
        });
    ToDoModel res = ToDoModel.fromJson(result);
    return res;
  }

  static Future<AddResultModel> addToDo(data) async {
    var result = await HttpUtils.request('/plan/addToDoList',
        method: HttpUtils.POST, data: data);
    AddResultModel res = AddResultModel.fromJson(result);
    return res;
  }
}
