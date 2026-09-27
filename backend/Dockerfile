FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS build
WORKDIR /src
COPY ["WorkGrid.Api/WorkGrid.Api.csproj", "WorkGrid.Api/"]
RUN dotnet restore "WorkGrid.Api/WorkGrid.Api.csproj"
COPY . .
WORKDIR "/src/WorkGrid.Api"
RUN dotnet build "WorkGrid.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "WorkGrid.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "WorkGrid.Api.dll"]
