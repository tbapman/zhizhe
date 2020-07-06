class AddResultModel {
  int httpStatus;
  AddResultData data;
  String msg;

  AddResultModel({this.httpStatus, this.data, this.msg});

  AddResultModel.fromJson(Map<String, dynamic> json) {
    httpStatus = json['httpStatus'];
    data = json['data'] != null ? new AddResultData.fromJson(json['data']) : null;
    msg = json['msg'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['httpStatus'] = this.httpStatus;
    if (this.data != null) {
      data['data'] = this.data.toJson();
    }
    data['msg'] = this.msg;
    return data;
  }
}

class AddResultData {
  String sId;
  String id;
  String type;
  String todo;
  String status;
  String date;
  int value;
  int coin;
  int iV;

  AddResultData(
      {this.sId,
      this.id,
      this.type,
      this.todo,
      this.status,
      this.date,
      this.value,
      this.coin,
      this.iV});

  AddResultData.fromJson(Map<String, dynamic> json) {
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