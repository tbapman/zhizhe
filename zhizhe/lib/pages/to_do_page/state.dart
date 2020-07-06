import 'package:fish_redux/fish_redux.dart';
import '../../models/to_do.dart';

class ToDoState implements Cloneable<ToDoState> {
  List<ToDoData> toDoList=new List<ToDoData>();

  @override
  ToDoState clone() {
    return ToDoState()
    ..toDoList=toDoList;
  }
}

ToDoState initState(Map<String, dynamic> args) {
  return ToDoState();
}
