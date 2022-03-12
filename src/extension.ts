/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { window, commands, ExtensionContext, Range, SnippetString } from 'vscode';

export function activate(context: ExtensionContext) {
    function generateSpace(num:int) {
        let space_str = '';
        
        for (let index = 0; index < num; index++) {
            space_str += ' ';
        }

        return space_str;
    }
    
	context.subscriptions.push([
        commands.registerTextEditorCommand('keon.formatting',async (textEditor: TextEditor) => {

            let range = new Range(textEditor.selection.start, textEditor.selection.end);

            let selection_text = textEditor.document.getText(range);

            
            // let selection_line = selection_text.split(/[(\r\n)\r\n]{1}/);
            let selection_line = selection_text.split(/\r?\n/);

            let new_selection_line = [];
            let insert_flag        = 0;
            let last_index         = -3;
            selection_line.forEach((str, index) => {
                let search_res = str.search(/^\/\//, str);
                
                if (search_res === 0) {
                    str = str.replace(/^[\/]*/, '');
                    
                    if (index == last_index+1) {
                        insert_flag = insert_flag;
                    } else {
                        insert_flag = str.match(/^[ ]*/)[0].length;
                    }
                    last_index = index;
                    
                    let arr_str = str.split('');

                    let annotion = '// ';
                    if (arr_str.length >= insert_flag) {
                        arr_str.splice(insert_flag,0,annotion);
                        str = arr_str.join('');
                    } else {
                        str = generateSpace(insert_flag) + annotion;
                    }
                }
                
                
                new_selection_line.push(str);
            });

            let new_selection_text = new_selection_line.join("\r\n");

            let diff_rule = /[\r\n \/]*/g;
            let diff1 = new_selection_text.replace(diff_rule, '');
            let diff2 = selection_text.replace(diff_rule, '');
            if (diff1 != diff2) {
                window.showErrorMessage('代码格式化过程中可能发生了错误，请检查格式化后的代码是否正常！');
            } else {
                window.showInformationMessage('格式化成功');
            }
            

            let snippet_tring = new SnippetString(new_selection_text.replace(/\$/g, '\\$'));
            
            textEditor.insertSnippet(snippet_tring);
        })
    ]);
}
