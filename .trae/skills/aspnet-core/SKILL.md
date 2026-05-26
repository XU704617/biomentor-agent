---
name: aspnet-core
description: Build, review, and refactor ASP.NET Core applications using current official guidance. Invoke when working on Blazor, Razor Pages, MVC, Minimal APIs, Web APIs, SignalR, gRPC, middleware, DI, or configuration.
---

# ASP.NET Core

Build, review, and architect ASP.NET Core applications using current .NET guidance.

## Overview

Choose the right ASP.NET Core application model, compose the host and request pipeline correctly, and implement features in the framework style Microsoft documents today.

## Workflow

1. Confirm the target framework, SDK, and current app model (Blazor, Razor Pages, MVC, Minimal APIs, etc.)
2. For new apps, start from the correct `dotnet new` template
3. For existing solutions, follow the solution's conventions first and use these references to avoid framework misuse

## Default Operating Assumptions

- Prefer the latest stable ASP.NET Core and .NET
- Prefer `WebApplicationBuilder` and `WebApplication`. Avoid older `Startup` and `WebHost` patterns unless the codebase already uses them
- Prefer built-in DI, options/configuration, logging, ProblemDetails, OpenAPI, health checks, rate limiting, output caching, and Identity before adding third-party infrastructure
- Keep feature slices cohesive so pages, components, endpoints, controllers, validation, services, data access, and tests are easy to trace
- Respect the existing app model. Do not rewrite Razor Pages to MVC or controllers to Minimal APIs without a clear reason

## Application Models

### Minimal APIs

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/hello", () => "Hello World");
app.MapGet("/items/{id}", (int id, AppDbContext db) =>
    db.Items.Find(id) is Item item ? Results.Ok(item) : Results.NotFound());

app.Run();
```

### Controller-Based APIs

```csharp
[ApiController]
[Route("api/[controller]")]
public class ItemsController : ControllerBase
{
    [HttpGet("{id}")]
    public async Task<ActionResult<Item>> Get(int id, AppDbContext db)
    {
        var item = await db.Items.FindAsync(id);
        return item is null ? NotFound() : Ok(item);
    }
}
```

### Razor Pages

```csharp
public class IndexModel : PageModel
{
    public List<Item> Items { get; set; } = [];

    public async Task OnGetAsync(AppDbContext db)
    {
        Items = await db.Items.ToListAsync();
    }
}
```

### Blazor Web App

```razor
@page "/items"
@rendermode InteractiveServer

@inject AppDbContext Db

<h3>Items</h3>
@if (items is null)
{
    <p>Loading...</p>
}
else
{
    @foreach (var item in items)
    {
        <div>@item.Name</div>
    }
}

@code {
    private List<Item>? items;

    protected override async Task OnInitializedAsync()
    {
        items = await Db.Items.ToListAsync();
    }
}
```

## Configuration and DI

```csharp
var builder = WebApplication.CreateBuilder(args);

// Options pattern
builder.Services.Configure<MyOptions>(builder.Configuration.GetSection("MyOptions"));

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Services
builder.Services.AddScoped<IItemService, ItemService>();
```

## Middleware Pipeline

```csharp
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapRazorPages();

app.Run();
```

## Entity Framework Core

```csharp
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Item> Items => Set<Item>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Item>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
        });
    }
}
```

## Security

- Use `[Authorize]` attribute for protected endpoints
- Use ASP.NET Core Identity for user management
- Use JWT Bearer tokens or cookie authentication
- Enable CORS selectively: `builder.Services.AddCors(...)`
- Use `builder.Services.AddHsts()` in production
- Validate anti-forgery tokens for form posts in Razor Pages/MVC

## Testing

Prefer integration tests with `WebApplicationFactory`:

```csharp
public class ItemsTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public ItemsTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetItems_ReturnsSuccess()
    {
        var response = await _client.GetAsync("/api/items");
        response.EnsureSuccessStatusCode();
    }
}
```
