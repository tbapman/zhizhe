import 'package:fish_redux/fish_redux.dart';
import 'package:zhizhe/models/to_do.dart';

import 'action.dart';
import 'state.dart';


Reducer<ToDoState> buildReducer() {
  return asReducer(
    <Object, Reducer<ToDoState>>{
      ToDoAction.action: _onAction,
      ToDoAction.init: _onInit,
    },
  );
}

ToDoState _onAction(ToDoState state, Action action) {
  final ToDoState newState = state.clone();
  return newState;
}

ToDoState _onInit(ToDoState state, Action action) {
  final List<ToDoData> toDoList=action.payload;
  final ToDoState newState = state.clone()..toDoList=toDoList;
  return newState;
}
