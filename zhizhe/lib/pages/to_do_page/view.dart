import 'package:fish_redux/fish_redux.dart';
import 'package:flutter/material.dart';

import 'action.dart';
import 'state.dart';

Widget buildView(ToDoState state, Dispatch dispatch, ViewService viewService) {
  var buildListView = ListView.builder(
    itemCount: state.toDoList.length,
    itemBuilder: (BuildContext context, int index) {
      return Card(
        child: ListTile(
            leading: FlutterLogo(),
            title: Text(state.toDoList[index].todo.toString())),
      );
    },
  );

  Widget buildTextField(TextEditingController controller) {
    void _addToDo() {
      final obj={
        'id':'15840128101406283378',
        'todo':controller.text,
        'date':DateTime.now().toString()
      };
      print('>>>>');
      print(obj);
      print('${controller.text}');
      dispatch(ToDoActionCreator.addToDo(obj));
    }

    return TextField(
      controller: controller,
      style: TextStyle(color: Colors.yellowAccent),
      decoration: InputDecoration(
          filled: true,
          fillColor: Colors.lightBlue,
          border: OutlineInputBorder(),
          suffixIcon: GestureDetector(
            onTap: () {
              _addToDo();
            },
            child: Container(
              margin: EdgeInsets.all(10),
              decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  color: Colors.grey.withOpacity(0.4)),
              child: Icon(
                Icons.arrow_upward,
                color: Colors.grey.withOpacity(0.4),
                size: 20,
              ),
            ),
          )),
    );
  }

  final controller = TextEditingController();
  controller.addListener(() {
    print('input ${controller.text}');
  });

  return Scaffold(
      appBar: AppBar(title: Text('待做')),
      body: Stack(
        children: <Widget>[
          Container(
            child: buildListView,
          ),
          Positioned(
            child: Container(child: buildTextField(controller)),
            bottom: 0,
            left: 0,
            right: 0,
          )
        ],
      ));
}
