import 'package:fish_redux/fish_redux.dart';

import 'effect.dart';
import 'reducer.dart';
import 'state.dart';
import 'view.dart';

class ExercisePage extends Page<ExerciseState, Map<String, dynamic>> {
  ExercisePage()
      : super(
            initState: initState,
            effect: buildEffect(),
            reducer: buildReducer(),
            view: buildView,
            dependencies: Dependencies<ExerciseState>(
                adapter: null,
                slots: <String, Dependent<ExerciseState>>{
                }),
            middleware: <Middleware<ExerciseState>>[
            ],);

}
