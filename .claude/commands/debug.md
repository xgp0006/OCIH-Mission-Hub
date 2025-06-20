# /debug Command - NASA JPL Refined

## 🎯 COMMAND STRUCTURE
```yaml
TRIGGER: /debug
JPL_FOCUS: Safety, bounded operations, validation
MAX_STEPS: 8 (JPL:4 - simplicity)
TIMEOUT: 4 hours max (JPL:2 - bounded)
```

## 🔄 REFINED WORKFLOW

### PHASE 1: VALIDATE INPUTS (JPL:7)
```yaml
1_INPUT_VALIDATION:
  VERIFY:
    - Log file exists and readable
    - Error list properly formatted
    - File size < 10MB (JPL:3 - memory safety)
  
  OUTPUT: 
    <input_status>
    ✓ Log file: [size]KB
    ✓ Errors: [count] identified
    ✓ Context: [complete/partial]
    </input_status>
```

### PHASE 2: BOUNDED ANALYSIS (JPL:2,4)
```yaml
2_ERROR_ANALYSIS:
  CONSTRAINTS:
    - Max 100 errors processed (JPL:2)
    - Analysis time < 5 minutes
    - Categories: syntax|runtime|logic|integration
  
  PROCESS:
    for (i = 0; i < Math.min(errors.length, 100); i++) {
      categorizeError(errors[i]) // JPL:2 bounded loop
    }
  
  OUTPUT:
    <error_analysis>
    - Primary error type: [type]
    - Affected modules: [list max 10]
    - Severity: critical|high|medium|low
    - Pattern detected: [yes/no]
    </error_analysis>
```

### PHASE 3: CONTEXT SAFETY (JPL:9)
```yaml
3_CONTEXT_GATHERING:
  NULL_CHECKS:
    - Framework version?: required
    - Environment?: required
    - Recent changes?: optional
    - Test coverage?: optional
  
  MCP_TOOLS (JPL:7 - verify sources):
    - mcp__github__get_file_contents(error_locations)
    - mcp__github__search_code(error_patterns)
    - Timeout: 30s per operation
  
  OUTPUT:
    <context_questions>
    REQUIRED:
    - What framework version?
    - What triggered this error?
    
    OPTIONAL:
    - Any recent dependency updates?
    - Previous working version?
    </context_questions>
```

### PHASE 4: RESEARCH BOUNDS (JPL:2,3)
```yaml
4_TARGETED_RESEARCH:
  LIMITS:
    - Max 5 searches (JPL:2)
    - 2 minute timeout per search
    - Memory pool: 50MB for results
  
  PRIORITY_SEARCH:
    1. Context7 → Official docs (most trusted)
    2. GitHub issues → Known bugs
    3. Firecrawl → Community solutions
  
  OUTPUT:
    <research_summary>
    Sources consulted: [count]/5
    Relevant findings: [max 3 key points]
    Confidence: high|medium|low
    </research_summary>
```

### PHASE 5: SIMPLE PROPOSALS (JPL:1,4)
```yaml
5_REPAIR_OPTIONS:
  EXACTLY_3_PLANS: # JPL:1 - simple choices
    
    <repair_proposals>
    PLAN A - MINIMAL (JPL:4 - small change):
      Changes: [< 20 lines]
      Risk: LOW
      Time: 30 min
      Validates: Original error only
    
    PLAN B - STANDARD (JPL:7 - proper fix):
      Changes: [< 100 lines]
      Risk: MEDIUM
      Time: 2 hours
      Validates: Error + edge cases
    
    PLAN C - ROBUST (JPL:10 - zero tolerance):
      Changes: [< 200 lines]
      Risk: HIGHER
      Time: 4 hours
      Validates: Full prevention
    </repair_proposals>
```

### PHASE 6: EXECUTION SAFETY (JPL:5,6)
```yaml
6_REPAIR_EXECUTION:
  AGENT_ISOLATION: # JPL:6 - data isolation
    
    <repair_plan>
    PARALLEL_SAFE (no conflicts):
      Agent1: Fix file A
      Agent2: Fix file B
      Agent3: Write tests
    
    SEQUENTIAL_REQUIRED:
      Agent4: Integration test (after 1-3)
      Agent5: Build validation
      Agent6: Commit changes
    
    ROLLBACK: Git stash saved before changes
    </repair_plan>
```

### PHASE 7: BOUNDED EXECUTION (JPL:2)
```yaml
7_AUTONOMOUS_READY:
  SAFEGUARDS:
    - Timeout: 4 hours absolute max
    - Checkpoint every 30 minutes
    - Abort on 3 consecutive failures
  
  <execution_ready>
  Ready to execute Plan [selected].
  Safeguards:
    ✓ Timeout: 4h max
    ✓ Rollback: enabled
    ✓ Validation: each step
  
  Type 'proceed' or 'autonomous' to start.
  </execution_ready>
```

### PHASE 8: ZERO TOLERANCE VALIDATION (JPL:10)
```yaml
8_FINAL_VALIDATION:
  MANDATORY_CHECKS:
    - Original error: must be fixed
    - New errors: must be zero
    - Tests: must pass 100%
    - Performance: no regression
    - Memory: no leaks
  
  <validation_summary>
  VALIDATION REPORT:
  ✅ Original error: RESOLVED
  ✅ New errors: 0
  ✅ Tests added: [count]
  ✅ Tests passing: 100%
  ✅ Build status: SUCCESS
  ✅ Memory delta: +0KB
  
  Confidence: 95%
  </validation_summary>
```

## 🚀 JPL SAFETY FEATURES

### TIMEOUTS (JPL:2)
```yaml
Operation_Timeouts:
  - File read: 10s
  - MCP search: 30s  
  - Test run: 5min
  - Total: 4 hours
```

### MEMORY LIMITS (JPL:3)
```yaml
Memory_Pools:
  - Log parsing: 10MB
  - Search results: 50MB
  - Code changes: 5MB
  - Total: < 100MB
```

### ERROR HANDLING (JPL:9)
```yaml
Every_Operation:
  try {
    result = await operation()
    validate(result) // JPL:7
  } catch (error) {
    log(error)
    return safeDefault // never crash
  }
```

## 🎯 QUICK REFERENCE
```yaml
/debug → Validates → Analyzes → Researches → Proposes → Executes → Verifies

JPL Rules Applied:
- Simple flow (JPL:1) ✓
- Bounded operations (JPL:2) ✓  
- Memory safety (JPL:3) ✓
- Short phases (JPL:4) ✓
- Isolated agents (JPL:6) ✓
- Everything validated (JPL:7) ✓
- Null safety (JPL:9) ✓
- Zero tolerance (JPL:10) ✓
```

---
**Safety: NASA JPL** | **Bounded: Always** | **Validated: Every step** | **Timeout: 4h max**