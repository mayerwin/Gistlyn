﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Rosling.Common.Objects;
using Microsoft.CodeAnalysis.CSharp.Scripting;
using Microsoft.CodeAnalysis.Diagnostics;
using Microsoft.CodeAnalysis.Scripting;

namespace Rosling.SnippetEngine
{
    public class ScriptRunner
    {
        public async Task<ScriptExecutionResult> Execute(string script)
        {
            ScriptExecutionResult result = new ScriptExecutionResult() { Variables = new List<VariableInfo>(), Errors = new List<ErrorInfo>() };

            try
            {
                var state = await CSharpScript.RunAsync<int>(script);

                foreach (var variable in state.Variables)
                    result.Variables.Add(new VariableInfo() { Name = variable.Name, Value = variable.Value.ToString(), Type = variable.Type.ToString() });
            } catch (CompilationErrorException e)
            {
                foreach (var err in e.Diagnostics)
                    result.Errors.Add(new ErrorInfo() { Info = err.ToString() });
            }

            return result;
        }
    }
}
