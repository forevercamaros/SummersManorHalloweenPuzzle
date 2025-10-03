using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using MongoDB.Driver;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SummersManorHalloweenPuzzle.Controllers
{
    [ApiController]
    public class SettingsController : ControllerBase
    {
        private readonly IConfiguration Configuration;
        private readonly ILogger<SettingsController> _logger;
        private string _MongoDBUserName = string.Empty, _MongoDBPassword = string.Empty, _MongoDBServer = string.Empty;

        public SettingsController(ILogger<SettingsController> logger, IConfiguration configuration)
        {
            Configuration = configuration;
            _logger = logger;
            _MongoDBUserName = Environment.GetEnvironmentVariable("MONGO_INITDB_ROOT_USERNAME");
            _MongoDBPassword = Environment.GetEnvironmentVariable("MONGO_INITDB_ROOT_PASSWORD");
            _MongoDBServer = Environment.GetEnvironmentVariable("MONGO_SERVER");
        }

        [HttpGet]
        [Route("GetGameSettings")]
        public GameSettingsResponse GetGameSettings()
        {
            try
        {
                _logger.LogInformation("Getting game settings");
                
                if (string.IsNullOrEmpty(_MongoDBUserName) || string.IsNullOrEmpty(_MongoDBPassword) || string.IsNullOrEmpty(_MongoDBServer))
                {
                    _logger.LogWarning("MongoDB connection parameters not found, returning default settings");
                    return new GameSettingsResponse 
                    { 
                        Success = true, 
                        Settings = GetDefaultSettings() 
                    };
                }

                var mongoDbConString = $"mongodb://{_MongoDBUserName}:{_MongoDBPassword}@{_MongoDBServer}:27017/SummersManor?authSource=admin";
                var settings = MongoClientSettings.FromConnectionString(mongoDbConString);
                settings.ServerApi = new ServerApi(ServerApiVersion.V1);
                var client = new MongoClient(settings);
                var database = client.GetDatabase("SummersManor");
                var collection = database.GetCollection<GameSettingsDocument>("GameSettings");
                
                var settingsDoc = collection.Find(new BsonDocument()).FirstOrDefault();
                
                if (settingsDoc == null)
                {
                    _logger.LogInformation("No game settings found in database, returning default settings");
                    return new GameSettingsResponse 
                    { 
                        Success = true, 
                        Settings = GetDefaultSettings() 
                    };
                }
                
                return new GameSettingsResponse 
                { 
                    Success = true, 
                    Settings = settingsDoc.Settings
                };
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error getting game settings");
                return new GameSettingsResponse 
                { 
                    Success = true, // Return success with default settings as fallback
                    Error = e.Message,
                    Settings = GetDefaultSettings() 
                };
            }
        }

        [HttpPost]
        [Route("SaveGameSettings")]
        public SaveGameSettingsResponse SaveGameSettings([FromBody] SaveGameSettingsRequest request)
        {
            try
            {
                _logger.LogInformation("Saving game settings");
                
                if (string.IsNullOrEmpty(_MongoDBUserName) || string.IsNullOrEmpty(_MongoDBPassword) || string.IsNullOrEmpty(_MongoDBServer))
                {
                    return new SaveGameSettingsResponse { Success = false, Error = "MongoDB connection parameters not configured" };
                }

                var mongoDbConString = $"mongodb://{_MongoDBUserName}:{_MongoDBPassword}@{_MongoDBServer}:27017/SummersManor?authSource=admin";
                var settings = MongoClientSettings.FromConnectionString(mongoDbConString);
                settings.ServerApi = new ServerApi(ServerApiVersion.V1);
                var client = new MongoClient(settings);
                var database = client.GetDatabase("SummersManor");
                var collection = database.GetCollection<GameSettingsDocument>("GameSettings");

                // Delete existing settings
                collection.DeleteMany(new BsonDocument());

                // Insert new settings
                var settingsDoc = new GameSettingsDocument
                {
                    Settings = request.Settings,
                    LastUpdated = DateTime.UtcNow
                };

                collection.InsertOne(settingsDoc);

                return new SaveGameSettingsResponse { Success = true };
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error saving game settings");
                return new SaveGameSettingsResponse { Success = false, Error = e.Message };
            }
        }

        private GameSettings GetDefaultSettings()
        {
            return new GameSettings
            {
                TimerDuration = 2400 // Default 40 minutes (2400 seconds)
            };
        }
    }

    public class GameSettingsDocument
    {
        [BsonId]
        public ObjectId Id { get; set; }
        public GameSettings Settings { get; set; }
        public DateTime LastUpdated { get; set; }
    }

    public class GameSettings
    {
        public int TimerDuration { get; set; }
    }

    public class GameSettingsResponse
    {
        public bool Success { get; set; }
        public GameSettings Settings { get; set; }
        public string Error { get; set; }
    }

    public class SaveGameSettingsRequest
    {
        public GameSettings Settings { get; set; }
    }

    public class SaveGameSettingsResponse
    {
        public bool Success { get; set; }
        public string Error { get; set; }
    }
}