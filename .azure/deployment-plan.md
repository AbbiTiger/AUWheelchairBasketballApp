# Azure Deployment Plan - AU Wheelchair Basketball App

**Status**: Planning Phase  
**Date**: 2026-04-07  
**Target**: Azure Static Web Apps + Azure Functions + Cosmos DB  
**Approach**: AZD (Azure Developer CLI) + Bicep Infrastructure as Code  
**Region**: Will be determined by Azure credits (user's account)

---

## Project Analysis

### Application Stack
- **Frontend**: Vite + React with Radix UI components
- **Backend**: Azure Functions (Node.js 20) with 3 HTTP triggers:
  - `GET /api/players` - Player management
  - `GET /api/games` - Game management  
  - `GET /api/events` - Event tracking
- **Database**: Cosmos DB (NoSQL) for Events, Games, Players
- **Additional**: Stripe integration for payments

### Existing Configuration
✅ Already has `staticwebapp.config.json` configured for Azure Static Web Apps routing
✅ API endpoints configured for `/api/*` routes
✅ SPA fallback configured for React routing

---

## Execution Plan

### Phase 1: Initialize AZD (if not already initialized)
- [ ] Check for existing `.azure` directory structure
- [ ] Run `azd init` to set up AZD project files
- [ ] Create `azure.yaml` manifest defining frontend and API services

### Phase 2: Infrastructure as Code Generation
- [ ] Generate `infra/main.bicep` with these resources:
  - Azure Static Web App (for React frontend)
  - Azure Functions App (Node.js 20 runtime)
  - App Service Plan (consumption tier for Functions)
  - Cosmos DB account + database + containers
  - Storage Account (for Functions)
  - Log Analytics Workspace (monitoring)
  - Application Insights (APM)
- [ ] Generate `infra/parameters.bicep` with parameterized values
- [ ] Create `.github/workflows/deploy.yml` for CI/CD (optional)

### Phase 3: Configuration & Environment Setup
- [ ] Create `.azure/config.yaml` with project metadata
- [ ] Set up environment variables in `infra/main.bicep`:
  - `cosmosConnectionString` → Azure Functions
  - Static Web Apps API backend routing to Functions
- [ ] Configure Function App settings for Cosmos DB access

### Phase 4: Validation (azure-validate skill)
- [ ] Verify Bicep syntax and type checking
- [ ] Check RBAC role assignments for managed identities
- [ ] Validate Azure subscription quotas and capacity
- [ ] Confirm pricing tier selections

### Phase 5: Deployment (azure-deploy skill)
- [ ] Run `azd up` to:
  - Create resource group
  - Provision all Azure resources
  - Deploy React frontend to Static Web App
  - Deploy Functions to Function App
  - Configure Cosmos DB connection strings
  - Apply role assignments
- [ ] Verify deployment outputs (Static Web App URL, API endpoint)

---

## Key Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| **Frontend Hosting** | Azure Static Web Apps | Native SPA support, free tier available, integrated CI/CD |
| **Backend Hosting** | Azure Functions | Serverless, event-driven, integrates with SWA |
| **Database** | Cosmos DB (provision new) | Already integrated in codebase, no-ops database |
| **IaC Tool** | Bicep | Native Azure, simpler than Terraform for single subscription |
| **API Integration** | Static Web Apps API backend | Native routing of `/api/*` to Functions App |
| **Monitoring** | Application Insights | Standard Azure monitoring, included in AZD template |

---

## Resource Hierarchy

```
Resource Group: apex-rg
├── Static Web App: apex-swa
│   └── Linked to Function App for /api/* routes
├── Function App: apex-func
│   ├── App Service Plan: apex-asp (Consumption)
│   ├── Storage Account: apexstg
│   └── Configuration: Cosmos DB connection secret
├── Cosmos DB: apex-cosmos
│   ├── Database: ApexDB
│   ├── Container: events
│   ├── Container: games
│   └── Container: players
├── Log Analytics Workspace: apex-logs
└── Application Insights: apex-insights
```

---

## Next Steps (After User Approval)

1. ✅ Create `.azure/azure.yaml` (project manifest)
2. ✅ Generate `infra/main.bicep` (all resources)
3. ✅ Generate `infra/parameters.bicep` (parameterized values)
4. ✅ Run `azd up` or validate first with `azd validate`
5. ✅ Verify deployment and test API endpoints

---

## Estimated Costs (Monthly)

| Service | Tier | Cost |
|---------|------|------|
| Static Web App | Free/Standard | $0-65 |
| Function App | Consumption | ~$10-30 (pay-per-execution) |
| Cosmos DB | Shared autoscale | ~$25-50 (RU autoscale) |
| Storage Account | Standard LRS | ~$5 |
| Log Analytics | Pay-as-you-go | ~$5-10 |
| **Total** | | **~$50-155/month** |

*Note: Static Web Apps free tier covers most small-medium apps*

---

## Ready to Deploy?

Once you approve this plan, I will:
1. Generate all infrastructure code (Bicep)
2. Run `azd init` to scaffold the project
3. Use `azure-validate` skill to pre-flight check everything
4. Use `azure-deploy` skill to execute `azd up` with error recovery

**Proceed?** [Yes / No]
