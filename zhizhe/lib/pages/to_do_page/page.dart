import 'package:fish_redux/fish_redux.dart';

import 'effect.dart';
import 'reducer.dart';
import 'state.dart';
import 'view.dart';

class ToDoPage extends Page<ToDoState, Map<String, dynamic>> {
  ToDoPage()
      : super(
            initState: initState,
            effect: buildEffect(),
            reducer: buildReducer(),
            view: buildView,
            dependencies: Dependencies<ToDoState>(
                adapter: null,
                slots: <String, Dependent<ToDoState>>{
                }),
            middleware: <Middleware<ToDoState>>[
            ],);

}
