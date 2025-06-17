import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import { CppComponent } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

export class CppParser {
  static async findCppFiles(workspacePath: string): Promise<string[]> {
    console.log(`🔍 Finding C++ files in: ${workspacePath}`);
    // Use glob.glob for async API in glob v10+
    const files = await glob.glob(`${workspacePath}/**/*.{cpp,h,hpp,cxx,cc,c}`, {
      nodir: true,
      ignore: ['**/node_modules/**', '**/dist/**']
    });
    console.log(`📁 Found ${files.length} C++ files:`, files);
    return files;
  }

  static async chunkCppFile(filePath: string): Promise<CppComponent[]> {
    console.log(`📄 Parsing file: ${filePath}`);
    const content = await fs.readFile(filePath, 'utf-8');
    console.log(`   File size: ${content.length} characters`);
    const components: CppComponent[] = [];
    const lines = content.split(/\r?\n/);

    // Simple regex for functions and classes - fixed to prevent infinite loops
    const functionRegex = /(\w+(?:::\w+)?)\s+(\w+)\s*\([^)]*\)\s*(?:const)?\s*\{/g;
    const classRegex = /class\s+(\w+)\s*(?::[^{]+)?\s*\{/g;
    const cFunctionRegex = /(\w+)\s+(\w+)\s*\([^)]*\)\s*\{/g;
    const cFunctionDeclRegex = /(\w+)\s+(\w+)\s*\(([^)]*)\)\s*$/gm;

    let match: RegExpExecArray | null;
    
    // Find classes with timeout protection
    console.log(`   🔍 Looking for classes...`);
    let classCount = 0;
    const maxMatches = 100; // Prevent infinite loops
    
    while ((match = classRegex.exec(content)) && classCount < maxMatches) {
      const name = match[1];
      const start = match.index;
      const lineNumber = content.slice(0, start).split(/\r?\n/).length;
      console.log(`   ✅ Found class: ${name} at line ${lineNumber}`);
      components.push({
        id: uuidv4(),
        name,
        type: 'class',
        content: match[0],
        filePath,
        lineNumber,
        dependencies: [],
        complexity: 1,
        metadata: {}
      });
      classCount++;
    }
    
    // Find C++ functions with timeout protection
    console.log(`   🔍 Looking for C++ functions...`);
    let funcCount = 0;
    
    while ((match = functionRegex.exec(content)) && funcCount < maxMatches) {
      const name = match[2];
      const start = match.index;
      const lineNumber = content.slice(0, start).split(/\r?\n/).length;
      console.log(`   ✅ Found C++ function: ${name} at line ${lineNumber}`);
      components.push({
        id: uuidv4(),
        name,
        type: 'function',
        content: match[0],
        filePath,
        lineNumber,
        dependencies: [],
        complexity: 1,
        metadata: {}
      });
      funcCount++;
    }
    
    // Find C functions with timeout protection
    console.log(`   🔍 Looking for C functions...`);
    let cFuncCount = 0;
    
    while ((match = cFunctionRegex.exec(content)) && cFuncCount < maxMatches) {
      const name = match[2];
      const start = match.index;
      const lineNumber = content.slice(0, start).split(/\r?\n/).length;
      console.log(`   ✅ Found C function: ${name} at line ${lineNumber}`);
      components.push({
        id: uuidv4(),
        name,
        type: 'function',
        content: match[0],
        filePath,
        lineNumber,
        dependencies: [],
        complexity: 1,
        metadata: {}
      });
      cFuncCount++;
    }
    
    console.log(`   📊 Total components found in ${filePath}: ${components.length}`);
    return components;
  }

  static async parseWorkspace(workspacePath: string): Promise<CppComponent[]> {
    console.log(`🚀 Starting workspace parsing: ${workspacePath}`);
    const files = await this.findCppFiles(workspacePath);
    let allComponents: CppComponent[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`\n📝 Processing file ${i + 1}/${files.length}: ${file}`);
      try {
        const components = await this.chunkCppFile(file);
        allComponents = allComponents.concat(components);
        console.log(`   ✅ Added ${components.length} components from ${file}`);
      } catch (error) {
        console.error(`   ❌ Error parsing ${file}:`, error);
      }
    }
    
    console.log(`\n🎉 Workspace parsing complete! Total components: ${allComponents.length}`);
    return allComponents;
  }
} 