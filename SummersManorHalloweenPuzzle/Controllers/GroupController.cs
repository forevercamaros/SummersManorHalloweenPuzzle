using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace SummersManorHalloweenPuzzle.Controllers
{   

    [ApiController]
    public class GroupController : Controller
    {        
        private readonly IConfiguration Configuration;
        private readonly ILogger<GroupController> _logger;

        public GroupController(ILogger<GroupController> logger, IConfiguration configuration)
        {
            Configuration = configuration;
            _logger=logger;
        }

        [HttpGet]
        [Route("GetAllGroups")]
        public bool GroupExists(string groupName)
        {
            using (SqlConnection con = new SqlConnection(Configuration["ConnectionString"]))
            using(SqlCommand cmd = new SqlCommand("SELECT GroupName FROM GroupCompletedTimes WHERE (GroupName = @GroupName)",con))
            using(SqlDataAdapter da = new SqlDataAdapter(cmd))
            {
                cmd.Parameters.Add(new SqlParameter("GroupName",groupName));
                var tbl = new DataTable();
                da.Fill(tbl);
                return (tbl.Rows.Count>0);
            }
        }
    }
}
