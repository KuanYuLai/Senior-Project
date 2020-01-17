import sample.Launcher;
import org.json.simple.JSONObject;
import java.io.IOException;
import java.io.BufferedReader;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/new")
public class Server extends HttpServlet {
    /*
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("text/plain");
        PrintWriter out = response.getWriter();
        if (isSuspicious(request)) {
            out.print("Access denied");
        } else {
            out.print("Welcome!");
        }
    }
    */
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("text/plain");
        //response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        StringBuilder sb = new StringBuilder();
        Launcher launch = new Launcher();
        BufferedReader reader = request.getReader();
        int i = 0;
        //String arg[5];
        try {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append('\n');
            }
        } finally {
            reader.close();
        }
        System.out.println(sb.toString());
        String result = "Success!\n";
        try{
            result += launch.Cal(sb.toString());
        } catch(Exception e){
            result = "Please try again!";
            System.out.println("Exception Catched");
        };
        //out.print("Printing result...\n" + sb.toString());
        out.print("Printing result...\n" + result);
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("text/plain");
        PrintWriter out = response.getWriter();
        System.out.println("    ==Print hello");
        out.print("Hi, I am a Smart Job Advisor. Please feed me with your setting. :) \n");
        //out.print(Launcher(request()));
    }

}
