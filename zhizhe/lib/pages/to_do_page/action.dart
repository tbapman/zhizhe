import 'package:fish_redux/fish_redux.dart';
import '../../models/to_do.dart';

//TODO replace with your own action
enum ToDoAction { action,init,addToDo }

class ToDoActionCreator {
  static Action onAction() {
    return const Action(ToDoAction.action);
  }
  static Action init(List<ToDoData> toDoData) {
    return  Action(ToDoAction.init,payload: toDoData);
  }
  static Action addToDo(Map<String,dynamic> toDoData) {
    return  Action(ToDoAction.addToDo,payload: toDoData);
  }
}
