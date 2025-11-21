export class ApplicationPattern {
  constructor(
    public readonly id: number,
    public readonly applicationId: number,
    public readonly pattern: string,
    public readonly priority: number,
    public readonly matchType: string,
    public readonly isActive: boolean,
  ) {}
}
