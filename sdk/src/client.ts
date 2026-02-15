import { HttpClient } from './utils/http';
import { AuthModule } from './modules/auth';
import { ProblemsModule } from './modules/problems';
import { SubmissionsModule } from './modules/submissions';
import { AiModule } from './modules/ai';
import { UsersModule } from './modules/users';
import { GithubModule } from './modules/github';
import { CodToYouClientOptions } from './types';

export class CodToYouClient {
  private http: HttpClient;

  public readonly auth: AuthModule;
  public readonly problems: ProblemsModule;
  public readonly submissions: SubmissionsModule;
  public readonly ai: AiModule;
  public readonly users: UsersModule;
  public readonly github: GithubModule;

  constructor(options: CodToYouClientOptions) {
    this.http = new HttpClient({
      baseUrl: options.baseUrl,
      token: options.token,
    });

    this.auth = new AuthModule(this.http);
    this.problems = new ProblemsModule(this.http);
    this.submissions = new SubmissionsModule(this.http);
    this.ai = new AiModule(this.http);
    this.users = new UsersModule(this.http);
    this.github = new GithubModule(this.http);
  }

  /**
   * Update the authentication token (e.g., after login or token refresh)
   */
  setToken(token: string) {
    this.http.setToken(token);
  }

  /**
   * Clear the authentication token
   */
  clearToken() {
    this.http.clearToken();
  }
}
