export class CorrectiveStatus {
  constructor(
    public readonly id: number,
    public readonly rawStatus: string,
    public readonly displayStatus: string,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
