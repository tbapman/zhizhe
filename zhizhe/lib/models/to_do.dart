class ToDoModel {
  int httpStatus;
  int total;
  List<ToDoData> data;

  ToDoModel({this.httpStatus, this.total, this.data});

  ToDoModel.fromJson(Map<String, dynamic> json) {
    httpStatus = json['httpStatus'];
    total = json['total'];
    if (json['data'] != null) {
      data = new List<ToDoData>();
      json['data'].forEach((v) {
        data.add(new ToDoData.fromJson(v));
      });
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['httpStatus'] = this.httpStatus;
    data['total'] = this.total;
    if (this.data != null) {
      data['data'] = this.data.map((v) => v.toJson()).toList();
    }
    return data;
  }
}

class ToDoData {
  String sId;
  String id;
  String type;
  String todo;
  String status;
  String date;
  int value;
  int coin;
  int iV;

  ToDoData(
      {this.sId,
      this.id,
      this.type,
      this.todo,
      this.status,
      this.date,
      this.value,
      this.coin,
      this.iV});

  ToDoData.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    id = json['id'];
    type = json['type'];
    todo = json['todo'];
    status = json['status'];
    date = json['date'];
    value = json['value'];
    coin = json['coin'];
    iV = json['__v'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['_id'] = this.sId;
    data['id'] = this.id;
    data['type'] = this.type;
    data['todo'] = this.todo;
    data['status'] = this.status;
    data['date'] = this.date;
    data['value'] = this.value;
    data['coin'] = this.coin;
    data['__v'] = this.iV;
    return data;
  }
}