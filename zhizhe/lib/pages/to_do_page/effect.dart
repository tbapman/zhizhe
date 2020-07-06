import 'package:fish_redux/fish_redux.dart';
import 'action.dart';
import 'state.dart';
import '../../api/to_do.dart';

Effect<ToDoState> buildEffect() {
  return combineEffects(<Object, Effect<ToDoState>>{
    Lifecycle.initState: _init,
    ToDoAction.action: _onAction,
    ToDoAction.addToDo: _addToDo,
  });
}

void _onAction(Action action, Context<ToDoState> ctx) {}

void _init(Action action, Context<ToDoState> ctx) {
  ToDoApi.getToDoData().then((res) {
    if (res.httpStatus == 200) {
      ctx.dispatch(ToDoActionCreator.init(res.data));
    }
  });
}

void _addToDo(Action action, Context<ToDoState> ctx) {
  ToDoApi.addToDo(action.payload).then((res) {
    if (res.httpStatus == 200) {
      ToDoApi.getToDoData().then((res) {
        if (res.httpStatus == 200) {
          ctx.dispatch(ToDoActionCreator.init(res.data));
        }
      });
    }
  });
}
