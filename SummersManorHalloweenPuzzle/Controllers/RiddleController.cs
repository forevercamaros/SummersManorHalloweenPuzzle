using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using MongoDB.Driver;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Microsoft.AspNetCore.Http;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.StaticFiles;

namespace SummersManorHalloweenPuzzle.Controllers
{
    [ApiController]
    public class RiddleController : ControllerBase
    {
        private readonly IConfiguration Configuration;
        private readonly ILogger<RiddleController> _logger;
        private readonly IWebHostEnvironment _environment;
        private string _MongoDBUserName = string.Empty, _MongoDBPassword = string.Empty, _MongoDBServer = string.Empty;

        public RiddleController(ILogger<RiddleController> logger, IConfiguration configuration, IWebHostEnvironment environment)
        {
            Configuration = configuration;
            _logger = logger;
            _environment = environment;
            _MongoDBUserName = Environment.GetEnvironmentVariable("MONGO_INITDB_ROOT_USERNAME");
            _MongoDBPassword = Environment.GetEnvironmentVariable("MONGO_INITDB_ROOT_PASSWORD");
            _MongoDBServer = Environment.GetEnvironmentVariable("MONGO_SERVER");
        }

        // Replace this helper to handle case-insensitive Audio/audio on Linux too
        private string GetWebAudioPath()
        {
            var contentRoot = _environment.ContentRootPath;
            var webRoot = _environment.WebRootPath ?? Path.Combine(contentRoot, "wwwroot");
            _logger.LogInformation("ContentRootPath={ContentRoot} WebRootPath={WebRoot}", contentRoot, webRoot);

            var lower = Path.Combine(webRoot, "audio");
            var upper = Path.Combine(webRoot, "Audio");

            if (Directory.Exists(lower)) return lower;
            if (Directory.Exists(upper)) return upper;

            // Create lowercase by default
            try
            {
                Directory.CreateDirectory(lower);
                _logger.LogInformation("Created audio directory at {Path}", lower);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed creating audio directory {Path}", lower);
            }
            return lower;
        }

        private string GetWebArPath()
        {
            var contentRoot = _environment.ContentRootPath;
            var webRoot = _environment.WebRootPath ?? Path.Combine(contentRoot, "wwwroot");
            var arPath = Path.Combine(webRoot, "ar");

            if (!Directory.Exists(arPath))
            {
                try
                {
                    Directory.CreateDirectory(arPath);
                    _logger.LogInformation("Created ar directory at {Path}", arPath);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed creating ar directory {Path}", arPath);
                }
            }
            return arPath;
        }

        [HttpGet]
        [Route("GetRiddleData")]
        public RiddleDataResponse GetRiddleData()
        {
            try
            {
                _logger.LogInformation("GetRiddleData endpoint called");
                
                if (string.IsNullOrEmpty(_MongoDBUserName) || string.IsNullOrEmpty(_MongoDBPassword) || string.IsNullOrEmpty(_MongoDBServer))
                {
                    _logger.LogWarning("MongoDB connection parameters not found, returning default riddles");
                    return new RiddleDataResponse 
                    { 
                        Success = true, 
                        Riddles = GetDefaultRiddles() 
                    };
                }

                var mongoDbConString = $"mongodb://{_MongoDBUserName}:{_MongoDBPassword}@{_MongoDBServer}:27017/SummersManor?authSource=admin";
                _logger.LogInformation($"Connecting to MongoDB");
                
                var settings = MongoClientSettings.FromConnectionString(mongoDbConString);
                settings.ServerApi = new ServerApi(ServerApiVersion.V1);
                var client = new MongoClient(settings);
                var database = client.GetDatabase("SummersManor");
                var collection = database.GetCollection<RiddleDataDocument>("RiddleData");
                
                var riddleDataDoc = collection.Find(new BsonDocument()).FirstOrDefault();
                
                if (riddleDataDoc == null)
                {
                    _logger.LogInformation("No riddle data found in database, returning default riddles");
                    return new RiddleDataResponse 
                    { 
                        Success = true, 
                        Riddles = GetDefaultRiddles() 
                    };
                }
                
                foreach (var r in riddleDataDoc.Riddles)
                {
                    _logger.LogInformation($"Riddle {r.Key}: Type={r.Value.Type}, " +
                        $"SequenceColors={r.Value.SequenceColors?.Count ?? 0}, " +
                        $"CorrectSequence={r.Value.CorrectSequence?.Count ?? 0}, " +
                        $"SequenceColorNames={r.Value.SequenceColorNames?.Count ?? 0}");
                }
                
                return new RiddleDataResponse 
                { 
                    Success = true, 
                    Riddles = riddleDataDoc.Riddles
                };
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error getting riddle data");
                return new RiddleDataResponse 
                { 
                    Success = true,
                    Error = e.Message,
                    Riddles = GetDefaultRiddles() 
                };
            }
        }

        [HttpGet]
        [Route("GetAudioFiles")]
        public AudioFilesResponse GetAudioFiles()
        {
            try
            {
                var audioPath = GetWebAudioPath();
                _logger.LogInformation("GetAudioFiles: resolved audioPath={AudioPath}", audioPath);

                if (!Directory.Exists(audioPath))
                {
                    _logger.LogWarning("Audio directory not found: {AudioPath}", audioPath);
                    return new AudioFilesResponse { Success = true, AudioFiles = new List<string>() };
                }

                // Case-insensitive extension match across platforms
                var files = Directory.EnumerateFiles(audioPath, "*", SearchOption.TopDirectoryOnly)
                    .Where(f => string.Equals(Path.GetExtension(f), ".mp3", StringComparison.OrdinalIgnoreCase))
                    .Select(Path.GetFileNameWithoutExtension)
                    .OrderBy(n => n)
                    .ToList();

                _logger.LogInformation("GetAudioFiles: count={Count} files=[{Files}]", files.Count, string.Join(", ", files));

                return new AudioFilesResponse { Success = true, AudioFiles = files };
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error getting audio files");
                return new AudioFilesResponse { Success = false, Error = e.Message, AudioFiles = new List<string>() };
            }
        }

        // New: stream audio from the same folder; avoids SPA fallback to index.html
        [HttpGet("audio/{fileName}")]
        public IActionResult GetAudio(string fileName)
        {
            if (string.IsNullOrWhiteSpace(fileName)) return BadRequest();

            var safe = Path.GetFileName(fileName);
            var final = safe.EndsWith(".mp3", StringComparison.OrdinalIgnoreCase) ? safe : $"{safe}.mp3";

            var path = Path.Combine(GetWebAudioPath(), final);
            _logger.LogInformation("GetAudio: resolved path={Path}", path);

            if (!System.IO.File.Exists(path))
            {
                _logger.LogWarning("GetAudio: file not found at {Path}", path);
                return NotFound();
            }

            var stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read);
            // Set correct content type
            return File(stream, "audio/mpeg", enableRangeProcessing: true);
        }

        [HttpPost]
        [Route("UploadAudioFile")]
        public async Task<UploadAudioResponse> UploadAudioFile(IFormFile audioFile)
        {
            try
            {
                _logger.LogInformation("UploadAudioFile endpoint called");

                if (audioFile == null || audioFile.Length == 0)
                {
                    return new UploadAudioResponse { Success = false, Error = "No file provided" };
                }

                if (!audioFile.ContentType.StartsWith("audio/") && !audioFile.FileName.EndsWith(".mp3", StringComparison.OrdinalIgnoreCase))
                {
                    return new UploadAudioResponse { Success = false, Error = "Only MP3 files are allowed" };
                }

                var audioPath = GetWebAudioPath();
                if (!Directory.Exists(audioPath))
                {
                    Directory.CreateDirectory(audioPath);
                }

                var safeName = Path.GetFileNameWithoutExtension(audioFile.FileName);
                var filePath = Path.Combine(audioPath, $"{safeName}.mp3");

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await audioFile.CopyToAsync(stream);
                }

                return new UploadAudioResponse
                {
                    Success = true,
                    FileName = safeName,
                    Message = "File uploaded successfully"
                };
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error uploading audio file");
                return new UploadAudioResponse { Success = false, Error = e.Message };
            }
        }

        [HttpGet]
        [Route("GetMindFiles")]
        public MindFilesResponse GetMindFiles()
        {
            try
            {
                var arPath = GetWebArPath();
                _logger.LogInformation("GetMindFiles: resolved arPath={ArPath}", arPath);

                if (!Directory.Exists(arPath))
                {
                    _logger.LogWarning("AR directory not found: {ArPath}", arPath);
                    return new MindFilesResponse { Success = true, MindFiles = new List<string>() };
                }

                var files = Directory.EnumerateFiles(arPath, "*.mind", SearchOption.TopDirectoryOnly)
                    .Select(Path.GetFileName)
                    .OrderBy(n => n)
                    .ToList();

                _logger.LogInformation("GetMindFiles: count={Count} files=[{Files}]", files.Count, string.Join(", ", files));

                return new MindFilesResponse { Success = true, MindFiles = files };
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error getting mind files");
                return new MindFilesResponse { Success = false, Error = e.Message, MindFiles = new List<string>() };
            }
        }

        [HttpPost]
        [Route("UploadMindFile")]
        public async Task<UploadMindResponse> UploadMindFile(IFormFile mindFile)
        {
            try
            {
                _logger.LogInformation("UploadMindFile endpoint called");

                if (mindFile == null || mindFile.Length == 0)
                {
                    return new UploadMindResponse { Success = false, Error = "No file provided" };
                }

                if (!mindFile.FileName.EndsWith(".mind", StringComparison.OrdinalIgnoreCase))
                {
                    return new UploadMindResponse { Success = false, Error = "Only .mind files are allowed" };
                }

                var arPath = GetWebArPath();
                var fileName = Path.GetFileName(mindFile.FileName);
                var filePath = Path.Combine(arPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await mindFile.CopyToAsync(stream);
                }

                _logger.LogInformation("Uploaded .mind file: {FileName} ({Size} bytes)", fileName, mindFile.Length);

                return new UploadMindResponse
                {
                    Success = true,
                    FileName = fileName,
                    Message = "AR target file uploaded successfully"
                };
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error uploading mind file");
                return new UploadMindResponse { Success = false, Error = e.Message };
            }
        }

        [HttpDelete]
        [Route("DeleteMindFile/{fileName}")]
        public DeleteMindResponse DeleteMindFile(string fileName)
        {
            try
            {
                _logger.LogInformation("DeleteMindFile endpoint called for: {FileName}", fileName);

                if (string.IsNullOrWhiteSpace(fileName))
                {
                    return new DeleteMindResponse { Success = false, Error = "No filename provided" };
                }

                // Sanitize filename to prevent path traversal
                var safeName = Path.GetFileName(fileName);

                if (!safeName.EndsWith(".mind", StringComparison.OrdinalIgnoreCase))
                {
                    return new DeleteMindResponse { Success = false, Error = "Only .mind files can be deleted" };
                }

                var arPath = GetWebArPath();
                var filePath = Path.Combine(arPath, safeName);

                if (!System.IO.File.Exists(filePath))
                {
                    return new DeleteMindResponse { Success = false, Error = "File not found" };
                }

                System.IO.File.Delete(filePath);
                _logger.LogInformation("Deleted .mind file: {FileName}", safeName);

                return new DeleteMindResponse
                {
                    Success = true,
                    Message = $"AR target file '{safeName}' deleted successfully"
                };
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error deleting mind file: {FileName}", fileName);
                return new DeleteMindResponse { Success = false, Error = e.Message };
            }
        }

        [HttpGet]
        [Route("GetArAudioFiles")]
        public ArAudioFilesResponse GetArAudioFiles()
        {
            try
            {
                var arPath = GetWebArPath();
                _logger.LogInformation("GetArAudioFiles: resolved arPath={ArPath}", arPath);

                if (!Directory.Exists(arPath))
                    return new ArAudioFilesResponse { Success = true, AudioFiles = new List<string>() };

                var files = Directory.EnumerateFiles(arPath, "*.mp3", SearchOption.TopDirectoryOnly)
                    .Select(Path.GetFileName)
                    .OrderBy(n => n)
                    .ToList();

                _logger.LogInformation("GetArAudioFiles: count={Count}", files.Count);
                return new ArAudioFilesResponse { Success = true, AudioFiles = files };
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error getting AR audio files");
                return new ArAudioFilesResponse { Success = false, Error = e.Message, AudioFiles = new List<string>() };
            }
        }
        [HttpPost]
        [Route("SaveRiddleData")]
        public SaveRiddleDataResponse SaveRiddleData([FromBody] SaveRiddleDataRequest request)
        {
            try
            {
                _logger.LogInformation("SaveRiddleData endpoint called");
                
                foreach (var r in request.Riddles)
                {
                    _logger.LogInformation($"Saving Riddle {r.Key}: Type={r.Value.Type}, " +
                        $"SequenceColors={r.Value.SequenceColors?.Count ?? 0}, " +
                        $"CorrectSequence={r.Value.CorrectSequence?.Count ?? 0}, " +
                        $"SequenceColorNames={r.Value.SequenceColorNames?.Count ?? 0}");
                }
                
                if (string.IsNullOrEmpty(_MongoDBUserName) || string.IsNullOrEmpty(_MongoDBPassword) || string.IsNullOrEmpty(_MongoDBServer))
                {
                    return new SaveRiddleDataResponse { Success = false, Error = "MongoDB connection parameters not configured" };
                }

                var mongoDbConString = $"mongodb://{_MongoDBUserName}:{_MongoDBPassword}@{_MongoDBServer}:27017/SummersManor?authSource=admin";
                var settings = MongoClientSettings.FromConnectionString(mongoDbConString);
                settings.ServerApi = new ServerApi(ServerApiVersion.V1);
                var client = new MongoClient(settings);
                var database = client.GetDatabase("SummersManor");
                var collection = database.GetCollection<RiddleDataDocument>("RiddleData");

                collection.DeleteMany(new BsonDocument());

                var riddleDataDoc = new RiddleDataDocument
                {
                    Riddles = request.Riddles,
                    LastUpdated = DateTime.UtcNow
                };

                collection.InsertOne(riddleDataDoc);

                return new SaveRiddleDataResponse { Success = true };
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error saving riddle data");
                return new SaveRiddleDataResponse { Success = false, Error = e.Message };
            }
        }

        private Dictionary<string, RiddleItem> GetDefaultRiddles()
        {
            return new Dictionary<string, RiddleItem>
            {
                ["riddle1"] = new RiddleItem
                {
                    Type = "audio",
                    AudioFile = "donttrytocheat4",
                    Riddle = "An eerie theme can make a scary movie even more memorable. Name the film this song is from.",
                    Answer = "Psycho",
                    BonusText = "Provide the last name of the actress who starred in this film for an extra 60 seconds",
                    BonusAnswer = "Leigh",
                    ClueText = "At a loss? Click here for a clue, but you will will be penalized 30 seconds.",
                    Clue = "This movie gave a lot of people a healthy fear of shower curtains"
                },
                ["riddle2"] = new RiddleItem
                {
                    Type = "text",
                    Riddle = "This fiery predator guards our yard along with his emaciated keeper. Are you brave enough to get up close? You'll need the number of pointed gnashers to move on.",
                    Answer = "20",
                    ClueText = "Need a hint? Click here for a clue, but you will will be penalized 30 seconds.",
                    Clue = "Hope this guy doesn't have a case of dragon breath."
                },
                ["riddle3"] = new RiddleItem
                {
                    Type = "text",
                    Riddle = "This towering crone has nearly everything she needs for her next potion. The last ingredient hides right nearby, hoping to avoid her notice. Can you find it?",
                    Answer = "Butterfly",
                    ClueText = "Need a clue? Click here for a clue, but you will no longer be eligible for a time bonus on this clue and will be penalized 30 seconds",
                    Clue = " Look closely at the basket she holds. Something is out of place."
                }
            };
        }
    }

    public class RiddleDataDocument
    {
        [BsonId]
        public ObjectId Id { get; set; }
        public Dictionary<string, RiddleItem> Riddles { get; set; }
        public DateTime LastUpdated { get; set; }
    }

    public class RiddleItem
    {
        [JsonPropertyName("type")]
        [BsonElement("Type")]
        public string Type { get; set; }
        
        [JsonPropertyName("audioFile")]
        [BsonElement("AudioFile")]
        public string AudioFile { get; set; }
        
        [JsonPropertyName("riddle")]
        [BsonElement("Riddle")]
        public string Riddle { get; set; }
        
        [JsonPropertyName("answer")]
        [BsonElement("Answer")]
        public string Answer { get; set; }
        
        [JsonPropertyName("bonusText")]
        [BsonElement("BonusText")]
        public string BonusText { get; set; }
        
        [JsonPropertyName("bonusAnswer")]
        [BsonElement("BonusAnswer")]
        public string BonusAnswer { get; set; }
        
        [JsonPropertyName("clueText")]
        [BsonElement("ClueText")]
        public string ClueText { get; set; }
        
        [JsonPropertyName("clue")]
        [BsonElement("Clue")]
        public string Clue { get; set; }
        
        [JsonPropertyName("sequenceColors")]
        [BsonElement("SequenceColors")]
        public List<string> SequenceColors { get; set; } = new List<string>();
        
        [JsonPropertyName("correctSequence")]
        [BsonElement("CorrectSequence")]
        public List<string> CorrectSequence { get; set; } = new List<string>();
        
        // Explicitly map names for JSON and Mongo
        [JsonPropertyName("sequenceColorNames")]
        [BsonElement("SequenceColorNames")]
        public Dictionary<string, string>? SequenceColorNames { get; set; } = new();
        
        [JsonPropertyName("qrSequence")]
        [BsonElement("QrSequence")]
        public List<string> QrSequence { get; set; } = new List<string>();

        [JsonPropertyName("mindFile")]
        [BsonElement("MindFile")]
        public string MindFile { get; set; }

        [JsonPropertyName("arAudioFile")]
        [BsonElement("ArAudioFile")]
        public string ArAudioFile { get; set; }

        [JsonPropertyName("arModelScale")]
        [BsonElement("ArModelScale")]
        public double? ArModelScale { get; set; }

        [JsonPropertyName("arModelPosition")]
        [BsonElement("ArModelPosition")]
        public List<double>? ArModelPosition { get; set; }

        [JsonPropertyName("arModelRotation")]
        [BsonElement("ArModelRotation")]
        public List<double>? ArModelRotation { get; set; }
    }

    public class RiddleDataResponse
    {
        public bool Success { get; set; }
        public Dictionary<string, RiddleItem> Riddles { get; set; }
        public string Error { get; set; }
    }

    public class SaveRiddleDataRequest
    {
        public Dictionary<string, RiddleItem> Riddles { get; set; }
    }

    public class SaveRiddleDataResponse
    {
        public bool Success { get; set; }
        public string Error { get; set; }
    }

    public class AudioFilesResponse
    {
        public bool Success { get; set; }
        public List<string> AudioFiles { get; set; }
        public string Error { get; set; }
    }

    public class UploadAudioResponse
    {
        public bool Success { get; set; }
        public string FileName { get; set; }
        public string Message { get; set; }
        public string Error { get; set; }
    }

    public class MindFilesResponse
    {
        public bool Success { get; set; }
        public List<string> MindFiles { get; set; }
        public string Error { get; set; }
    }

    public class UploadMindResponse
    {
        public bool Success { get; set; }
        public string FileName { get; set; }
        public string Message { get; set; }
        public string Error { get; set; }
    }

    public class DeleteMindResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public string Error { get; set; }
    }

    public class ArAudioFilesResponse
    {
        public bool Success { get; set; }
        public List<string> AudioFiles { get; set; }
        public string Error { get; set; }
    }
}