"use client";

import {
   headingsPlugin,
   listsPlugin,
   quotePlugin,
   thematicBreakPlugin,
   markdownShortcutPlugin,
   MDXEditor,
   type MDXEditorMethods,
   toolbarPlugin,
   ConditionalContents,
   ChangeCodeMirrorLanguage,
   UndoRedo,
   Separator,
   BoldItalicUnderlineToggles,
   ListsToggle,
   CreateLink,
   InsertImage,
   InsertTable,
   InsertThematicBreak,
   InsertCodeBlock,
   linkPlugin,
   linkDialogPlugin,
   tablePlugin,
   codeBlockPlugin,
   codeMirrorPlugin,
   diffSourcePlugin,
   BlockTypeSelect,
} from "@mdxeditor/editor";
import { basicDark } from "cm6-theme-basic-dark";
import { useTheme } from "next-themes";
import type { ForwardedRef } from "react";

import "@mdxeditor/editor/style.css";
import "./dark-editor.css";

interface EditorProps {
   value: string;
   fieldChange: (value: string) => void;
   editorRef: ForwardedRef<MDXEditorMethods> | null;
}

const Editor = ({ value, fieldChange, editorRef, ...props }: EditorProps) => {
   const { resolvedTheme } = useTheme();

   const theme = resolvedTheme === "dark" ? [basicDark] : [];
   return (
      <MDXEditor
         key={resolvedTheme}
         markdown={value}
         ref={editorRef}
         className="background-light800_dark200 light-border-2 markdown-editor dark-editor w-full border"
         onChange={fieldChange}
         plugins={[
            // Example Plugin Usage
            headingsPlugin(),
            listsPlugin(),
            linkPlugin(),
            linkDialogPlugin(),
            quotePlugin(),
            thematicBreakPlugin(),
            markdownShortcutPlugin(),
            tablePlugin(),
            codeBlockPlugin({
               defaultCodeBlockLanguage: "",
            }),
            codeMirrorPlugin({
               codeBlockLanguages: {
                  css: "css",
                  txt: "txt",
                  sql: "sql",
                  html: "html",
                  saas: "saas",
                  scss: "scss",
                  bash: "bash",
                  json: "json",
                  js: "javascript",
                  ts: "typescript",
                  "": "unspecified",
                  tsx: "typescript (React)",
                  jsx: "javascript (React)",
                  python: "python",
                  java: "java",
                  c: "c",
                  cpp: "c++",
                  csharp: "c#",
               },
               autoLoadLanguageSupport: true,
               codeMirrorExtensions: theme,
            }),
            diffSourcePlugin({
               viewMode: "rich-text",
               diffMarkdown: "",
            }),
            toolbarPlugin({
               toolbarContents: () => (
                  <ConditionalContents
                     options={[
                        {
                           when: (editor) => editor?.editorType === "codeBlock",
                           contents: () => <ChangeCodeMirrorLanguage />,
                        },
                        {
                           fallback: () => (
                              <span className="flex flex-wrap">
                                 <UndoRedo />
                                 <Separator />

                                 <BoldItalicUnderlineToggles />
                                 <BlockTypeSelect />
                                 <Separator />

                                 <ListsToggle />
                                 <Separator />

                                 <CreateLink />
                                 <InsertImage />
                                 <Separator />

                                 <InsertTable />
                                 <InsertThematicBreak />
                                 <InsertCodeBlock />
                              </span>
                           ),
                        },
                     ]}
                  />
               ),
            }),
         ]}
         {...props}
      />
   );
};

export default Editor;
