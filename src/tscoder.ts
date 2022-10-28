import { Project, StructureKind } from "ts-morph";

export abstract class tscoder {
    public static test1() {
        const project = new Project({
            tsConfigFilePath: "testsrc/tsconfig.json",
        });
        
        project.addSourceFilesAtPaths("testsrc/**/*{.d.ts,.ts}");
        
        const sourceFile = project.createSourceFile("testsrc/myStructureFile.ts",
            {
                statements: [{
                    kind: StructureKind.Enum,
                    name: "MyEnum",
                    members: [{
                        name: "member",
                    }],
                }, {
                    kind: StructureKind.Class,
                    name: "MyClass"
                }],
            },
            {
                overwrite: true
            }
        );
        
        sourceFile.saveSync();
        
    }
}