using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SummersManorHalloweenPuzzle
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                    webBuilder.UseKestrel(configure =>{
                        configure.Listen(System.Net.IPAddress.Any, 80);
                        configure.Listen(System.Net.IPAddress.Any, 443, listenOptions =>
                        {
                            listenOptions.UseHttps("certificate_fullchain.pfx", "Rpibbb013.");
                        });
                    });
                });                
    }
}
