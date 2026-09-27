FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS build
WORKDIR /src

COPY ["WorkGrid.Api.csproj", "./"]
RUN dotnet restore "WorkGrid.Api.csproj"

COPY . .
RUN dotnet build "WorkGrid.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "WorkGrid.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app

COPY --from=publish /app/publish .

ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "WorkGrid.Api.dll"]